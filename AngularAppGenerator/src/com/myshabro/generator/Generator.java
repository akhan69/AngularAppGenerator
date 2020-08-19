package com.myshabro.generator;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.sql.ResultSet;

public class Generator {

	Connection _db=null;
	//String _dbName = "evmandb";
	
	
	/*String _cfgFile = "config.txt";
	String _modelFolder = "d:/wamp/www/evtest/models";
	String _serviceFolder = "d:/wamp/www/evtest/services";
	String _restBase = "d:/wamp/www/evtest/rest"; */
	//String _include = "inc";
	String _dbName = null;
//	String _modelFolder = null;
//	String _serviceFolder=null;
	String _appFolder=null;
	String _restBase=null;
	String _propertiesFolder=null;
	
	Properties cfg = null;
	ArrayList<String> _tables = new ArrayList<String>();
	HashMap<String,String> _appModules = new HashMap<String,String>();
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		
		String cfgFile = System.getProperty("CFG_FILE");
		
		
		Generator g = new Generator(cfgFile);
		g.connectDb();
		g.getTables();
		g.createFiles();

	}
	
	Generator(String configFile) {
		cfg = new Properties();
		try {
			cfg.load(new FileInputStream(configFile));
		} catch (IOException ex) {
			ex.printStackTrace();
		}
		_dbName=cfg.getProperty("dbName");
//		_modelFolder=cfg.getProperty("modelFolder");
//		_serviceFolder=cfg.getProperty("serviceFolder");
		_restBase=cfg.getProperty("restBase");
		_appFolder=cfg.getProperty("appFolder");
		_propertiesFolder=cfg.getProperty("propertiesFolder");
		
		new File(_appFolder + "/models").mkdirs();
        new File(_appFolder + "/services").mkdirs();
		
				
	}
	
	void connectDb() {
		try {
		String connectionString = cfg.getProperty("connectionString");
		 Class.forName("com.mysql.jdbc.Driver").newInstance();
		 _db = DriverManager.getConnection(connectionString);
		} catch (Exception e) {
			e.printStackTrace();
			
		}
	}
	
	void getTables () {
		Statement stmt = null;
		ResultSet rs = null;
		
		try {
		    stmt = _db.createStatement();
		    String sql = String.format("select table_name from information_schema.tables where table_schema='%s'",_dbName);
		    rs = stmt.executeQuery(sql);
		    while (rs.next()) {
		    	_tables.add(rs.getString(1));
		    }

		} catch (Exception e) {
			e.printStackTrace();
		}
		finally {
			try {
			if (stmt != null)
				stmt.close();
			if (rs != null)
				rs.close();
			} catch (Exception e) {}
		}
	}
	
	void createFiles () {
		
		for (String t : _tables) {
			ArrayList <column> cols = getColumns (t);
			Properties props=getProperties(t);
			
			createModel(t, cols,props);
			createService(t,cols);
			createPhpService(t, cols,props);
			createComponent(t,cols, props);
			
		}
		createServicesModule();
		createAppModuleAdd();
	}
	Properties getProperties(String table) {
		Properties prop = new Properties();
		String tableKey = table + ".";
		
		Enumeration<?> e = this.cfg.propertyNames();
		while (e.hasMoreElements() ) {
		    String key = (String) e.nextElement();
		    if (key.startsWith(tableKey)) {
		        String value = cfg.getProperty(key);
		        prop.put(key.replace(tableKey, ""), value);
		    }
		}
		
		return prop;
	}
	ArrayList<String> getChildren(Properties props) {
		ArrayList<String> ret = new ArrayList<String>();
		
		if (props.containsKey("children")) {

    		try {
    			String[] list = props.get("children").toString().split(",");
    			for (String s: list) {
    				ret.add(s);
    			}
    		} catch (Exception e) {
    			e.printStackTrace();
    		}
		}
		return ret;
	}
	
	ArrayList <column> getColumns(String table) {
		Statement stmt = null;
		ResultSet rs = null;
		
		ArrayList<column> columns= new ArrayList<column>();
		try {
		    stmt = _db.createStatement();
		    String sql = String.format(
		    		"select column_name, data_type,column_key from information_schema.columns where table_schema='%s' and table_name = '%s'",_dbName,table);
		    rs = stmt.executeQuery(sql);
		    while (rs.next()) {
		    	column c = new column();
		    	c.name = rs.getString(1);
		    	c.datatype = rs.getString(2);
		    	if (rs.getString(3).equals("PRI"))
		    		c.isId = true;
		    	columns.add(c);
		    }

		} catch (Exception e) {
			e.printStackTrace();
		}
		finally {
			try {
			if (stmt != null)
				stmt.close();
			if (rs != null)
				rs.close();
			} catch (Exception e) {}
		}
		return columns;

	}
	
	void createModel(String table, ArrayList<column> cols, Properties props) {
		PrintWriter out=null;
		try {
		String template = new String(Files.readAllBytes(Paths.get("templates/model.ts")));
		
		String model = getModelFilename(table);
		
		String filename = (_appFolder + "/models/" + model + ".ts");	
		//build columns
		StringBuilder ctext = new StringBuilder();
		StringBuilder imports = new StringBuilder();

		for (column c : cols) {
			String type = "string";
			if (c.datatype.equals("int")) {
				type = "number";
			} else if (c.datatype.equals("date")|| 
					   c.datatype.equals("datetime")) {
				type="Date";
			} else if (c.datatype.equals("bit")) {
				type="boolean";
			}
			ctext.append(String.format("   public %s: %s;\r\n", getFieldName(c.name),type));
		}
		// Add joined cols
		if (props != null && props.containsKey("joinCols")) {
			String[] joinCols = props.getProperty("joinCols").split(",");
			for (String s : joinCols) {
				String col = s;
				String type = "string";
				if (s.contains("|")) {
					String[] vals = s.split("|");
					col = vals[0];
					if (vals.length > 1) {
						type = vals[1];
					}
				}
				// Now check if the column name has an alias using either = or as
				if (col.contains("=")) {
					col = col.split("=")[0];
				} else if (col.contains(" as ")) {
					col = col.split(" as ")[1];
				}

				ctext.append(String.format("   public %s: %s;\r\n", getFieldName(col),type));
			}
		}
		
		//If it has a parent then add a deleted property
//		if (props.containsKey("parents")) {
//			ctext.append("   public deleted: boolean = false;");
//		}
		//add it to all objects
		ctext.append("   public deleted: boolean = false;");
		
		//Add the child objects
		for (String e: getChildren(props)) {
			imports.append(String.format("import {%s} from './%s';\r\n", getModelName(e),getModelName(e)));
			ctext.append(String.format("   public %ss: %s[];\r\n", getFieldName(e),getModelName(e)));
		}
		
		//remove the last comma
		//ctext.delete(ctext.length() - 3, ctext.length() - 1);
		String s= template.replace("%model", getModelName(table))
				.replace("%fields", ctext)
				.replace("%idfield", getFieldName(getIdColName(cols)))
				.replace("%import", imports);
			
		out = new PrintWriter(filename);
		out.println(s);
		//base cass information 
		
		} catch (Exception e) {
			System.out.println("Error creating model:" + table);
			e.printStackTrace();
		} finally {
			if (out != null) 
				out.close();
		}
	}
	
	void createPhpService (String table, ArrayList<column> cols, Properties props) {
		PrintWriter out=null;
		try {
		String template = new String(Files.readAllBytes(Paths.get("templates/service.php")));
		String template_handler = new String(Files.readAllBytes(Paths.get("templates/handler.php")));
		String template_children = new String(Files.readAllBytes(Paths.get("templates/getChildObject.php")));
		String template_post_child = new String(Files.readAllBytes(Paths.get("templates/postChildObject.php")));
		String template_save_child = new String(Files.readAllBytes(Paths.get("templates/saveChildObject.php")));
		
		String model = getModelFilename(table);		
		String filename = (_restBase + "/" + model + ".php.inc");
		String filename_handler = (_restBase + "/" + model + ".php");
		
		StringBuilder includeList = new StringBuilder();
		
		StringBuilder getChildren = new StringBuilder();
		StringBuilder postChildren = new StringBuilder();
		StringBuilder saveChildren = new StringBuilder();
		

		for (String s : getChildren(props)) {
			includeList.append(String.format("require_once '%s.php.inc';\r\n", getModelFilename(s)));
			
			getChildren.append(template_children
					.replace("%class", getModelFilename(s))
					.replace("%idfield",getFieldName(getIdColName(cols)))
					.replace("%idcol",getIdColName(cols)));	
			
			postChildren.append(template_post_child
					.replace("%class", getModelFilename(s))
					.replace("%idfield",getFieldName(getIdColName(cols)))
					.replace("%idcol",getIdColName(cols)));	
			
			saveChildren.append(template_save_child
					.replace("%class", getModelFilename(s))
					.replace("%idfield",getFieldName(getIdColName(cols)))
					.replace("%idcol",getIdColName(cols)));	
		}
		
		String joinColumns= props.getProperty("joinCols");
		String account_col = props.getProperty("account_id");
		String ret_source = "FALSE";
		if (props.containsKey("retSource")) {
			ret_source = props.getProperty("retSource");
		}
		
		//if the key exists and it is false
		String bWebrequest = props.getProperty("webrequest","true");
		boolean isWebRequestOK = !Boolean.parseBoolean(bWebrequest);
		
		String excludeColumns = props.getProperty("excludeColumns","");
		String selCols = getSelectCols (table, cols,joinColumns,excludeColumns);
		
		String joinStatement = props.getProperty("joinStatement", "");
		
		String orderby = props.getProperty("orderby","");
		
		String whereAcct = getWhereAcct(cols,account_col);
		//System.console().printf("table: %s -- acct: %s", table, whereAcct);
		
		String sqlGetExt = getSqlGetExt(props);
		
		
		String s = template.replace("%table", table)
				.replace("%array", getArrayName(table))
				.replace("%idcol", getIdColName(cols))
				.replace("%idfield",getFieldName(getIdColName(cols)))
				.replace("%whereacct", whereAcct)
				.replace("%basesql", getBaseSQL(whereAcct))
				.replace("%model", model)
				.replace("%mapFieldToCol", getFieldToCol(cols))
				.replace("%joinStatement", joinStatement)
				.replace("%include", includeList.toString())
				.replace("%orderby", orderby.toString())
				.replace("%retSource",ret_source)
				.replace("%sql_get_ext", sqlGetExt.toString())
				.replace("%getChildren",getChildren.toString())
				.replace("%postChildren",postChildren.toString())
				.replace("%saveChildren",saveChildren.toString())
				.replace("%selectfields", selCols);
		
		out = new PrintWriter(filename);
		out.print(s);
		out.close();

		String requiredCapabilities = props.getProperty("capabilities","");
		//Add the 
		includeList.append(String.format("require_once '%s.php.inc';",model));
		s = template_handler.replace("%table", table)
//				.replace("%array", getArrayName(table))
//				.replace("%idcol", getIdColName(cols))
//				.replace("%whereacct", getWhereAcct(cols))
				.replace("%model", model)
				.replace("%blockwebrequest", "FALSE")
				//.replace("%blockwebrequest", getWebRequest(isWebRequestOK))
				.replace("%capabilityRequirements", getCapabilitiesArray(requiredCapabilities))
				.replace("%include", includeList.toString());
//				.replace("%selectfields", selCols);
		
		out = new PrintWriter(filename_handler);
		out.print(s);
		
		//base cass information 
		
		} catch (Exception e) {
			System.out.println("Error processing table: " + table);
			e.printStackTrace();
		} finally {
			if (out != null) 
				out.close();
		}
 	}	
	
	//This is needed to determine if we should add the account selection
	String getBaseSQL (String acctWhere) {
		if (acctWhere != null) {
			return "$baseSql = sprintf($this->sqlString['select'], $this->account_id );";
		}
		return "$baseSql = $this->sqlString['select']";
	}
	
	String getSelectCols (String table, ArrayList<column> cols, String joinColumns, String excludeColumns) {
		StringBuilder sb = new StringBuilder();
		
		// Create exclusion list
		HashMap<String, String> excludeCols = new HashMap<String,String>();
		String[] l = excludeColumns.split(",");
		for (String c : l) {
		    excludeCols.put(c, c);
		}
		
		for (column c: cols) {
		    if (!excludeCols.containsKey(c.name)) {
		        sb.append(String.format("t.%s as %s, ", c.name, getFieldName(c.name)));
		    }
		}
		sb.delete(sb.length() - 2, sb.length() - 1);
		if (joinColumns != null) {
			sb.append(", ");
			sb.append(joinColumns);
		}
		return sb.toString();
	}
	String getWhereAcct(ArrayList<column> cols, String account_col) {
		String s = "";
		if (account_col != null) {
			return " and " + account_col + "=%d";
		}
		for (column c: cols) {
			if (c.name.equals("account_id") && !c.isId) {
				return " and t.account_id=%d ";
			}
		}
		return s;
	}
	String getWebRequest (boolean b) {
		if (b) {
			return "TRUE";
		}
		return "FALSE";
	}
	String getCapabilitiesArray(String requiredCapabilities) {
	    
	    if (requiredCapabilities.equals("")) {
	        return "$capReq = array('GET' => array(0), 'POST' => array(0), 'PUT' => array(0), 'DELETE'=> array(0));";
	    }
	    StringBuilder rc = new StringBuilder("$capReq = array(");
	    
	    String format = "'%s' => array(%s)";
	    
	    String[] methodArray = requiredCapabilities.split("\\|");
	    rc.append(String.format(format, "GET", methodArray[0]));
	    rc.append(", ");
        rc.append(String.format(format, "POST", methodArray[1]));
        rc.append(", ");
        rc.append(String.format(format, "PUT", methodArray[2]));
        rc.append(", ");
        rc.append(String.format(format, "DELETE", methodArray[3]));
        rc.append(");");
	    
	    return rc.toString();
	}
	
	String getSqlGetExt(Properties props) {
	    //get the property keys
	    StringBuilder sb = new StringBuilder();
	    Enumeration<String> enums = (Enumeration<String>) props.propertyNames();
	    while (enums.hasMoreElements()) {
	      String key = enums.nextElement();
	      if (key.startsWith("sql_get_ext")) {
	          String v = key.split("\\.")[1];
    	      String value = props.getProperty(key);
    	      String s = String.format("       $this->sql_get_ext ['%s'] = '%s';\r\n",
    	                      v,value);
    	      
    	      sb.append(s);
	      }
	    }
	    return sb.toString();
	}
	
	void createServicesModule () {
		PrintWriter out=null;
		try {
			String template = new String(Files.readAllBytes(Paths.get("templates/services.module.ts")));
			
			String filename = (_appFolder + "/services/services.module.ts");	
			
			StringBuilder imports = new StringBuilder();
			StringBuilder declarations = new StringBuilder();
			StringBuilder export = new StringBuilder();
			int i=0;
			for ( String t: _tables) {
				i++;
				imports.append(String.format("import {%sService} from './%s.service';\r\n", getModelName(t), getModelFilename(t)));
				declarations.append(String.format("   %sService%s\r\n", getModelName(t), (i < _tables.size() ? "," : "")  ));
			}
			String s = template.replace("%IMPORT", imports)
					.replace("%DECLARATIONS", declarations)
					.replace("%EXPORTS", declarations);
			out = new PrintWriter(filename);
			out.println(s);
			
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (out != null) {
				out.close();
			}
		}
	}
	
	void createService(String table, ArrayList<column> cols) {
		PrintWriter out=null;
		try {
		String template = new String(Files.readAllBytes(Paths.get("templates/service.ts")));
		
		String service = getModelFilename(table);
		
		String filename = (_appFolder + "/services/" + service + ".service.ts");	
		
		String s = template.replace("%model", getModelName(table))
				.replace("%array", getArrayName(table))
				.replace("%idfield", getIdFieldName(cols))
				.replace("%item", getFieldName(table))
				.replace("%filename", service);
		
		out = new PrintWriter(filename);
		out.println(s);
		//base cass information 
		
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (out != null) 
				out.close();
		}		
	}
	
	void createComponent(String table, ArrayList<column> cols, Properties props ) {

	    HashMap<String,String> moduleList = new HashMap<String,String>();
	    String createComponent = props.getProperty("createComponent",null);
	    String component = getModelFilename(table);    
	    
	    String[] compList = new String[0];
	    if (createComponent != null) {
	        compList = createComponent.split(",");
	    } else {
	        return;
	    }
	    for (String componentType: compList) {
       	            
            // Create the component folder if it doesn't exist
            new File(_appFolder + "/" + component + "s").mkdirs();
    	    String[] comp = createBaseComponent(componentType, table, cols, props);
    	    moduleList.put(comp[0],comp[1]);
	    }
	    //Create Module file & app.module.add
	    PrintWriter out=null;
	    try {
	        String template = new String(Files.readAllBytes(Paths.get("templates/module.component.ts")));
	        String filename = (_appFolder + "/" + component + "s/" + component + "s.module.ts");
	        
	        StringBuilder imports = new StringBuilder();
	        StringBuilder declarations = new StringBuilder();
	        StringBuilder exports = new StringBuilder();
	        
	        for (Map.Entry<String, String> entry: moduleList.entrySet()) {
	            String i = String.format("import { %s } from '%s';\r\n", entry.getKey(), entry.getValue());
	            imports.append(i);
	            if (declarations.length() > 0) {
	                declarations.append(", " + entry.getKey());
	            } else {
	                declarations.append(entry.getKey());
	            }
                if (exports.length() > 0) {
                    exports.append(", " + entry.getKey());
                } else {
                    exports.append(entry.getKey());
                }

	        }
            String s = template.replace("%model", getModelName(table))
                    .replace("%imports", imports.toString())
                    .replace("%declarations", declarations.toString())
                    .replace("%exports",exports.toString());
            
            String modulePath = "./" + getModelFilename(table) + "s/" + getModelFilename(table) + "s.module";
            _appModules.put(getModelName(table) + "sModule", modulePath);
            
            out = new PrintWriter(filename);
            out.print(s);   	        
	    } catch (Exception e) {
            System.out.println("error processing module file:" + table);
            e.printStackTrace();
        } finally {
            if (out != null) 
                out.close();
        }
	    
	}
	
	String[] createBaseComponent(String componentType, String table, ArrayList<column> cols, Properties props ) {
	    
	    ArrayList<String> fileTypes = new ArrayList<String>();
	    fileTypes.add("ts");
	    fileTypes.add("html");
	    fileTypes.add("css");
	    
	    String model = getModelName(table);
	    String component = getModelFilename(table);
	    String cf = componentType.equals("base") ? "" : "-" + componentType;
	    String[] comp = new String[2];
	    
	    comp[0] = model + (cf.length() > 0 ? cf.substring(1, 2).toUpperCase() + cf.substring(2) : "") + "Component";
	    comp[1] = "./" + component + cf + ".component";
	    
	    for (String ft : fileTypes) { 
            PrintWriter out=null;
            try {
                String template = new String(Files.readAllBytes(Paths.get("templates/" + componentType + ".component." + ft)));
                
                //String component = getModelFilename(table);
             
                // Create the component folder if it doesn't exist
                new File(_appFolder + "/" + component + "s").mkdirs();
                
                String filename = (_appFolder + "/" + component + "s/" + component + cf + ".component." + ft);    

                
                String s = template.replace("%model", model)
                        .replace("%keyField", getIdFieldName(cols))
                        .replace("%item", getFieldName(table))
                        .replace("%selector",getSelectorName(table))
                        .replace("%filename", component);

                if (ft.equals("html")) {
                    String detailColumns = props.getProperty("detailColumns", null);
                    String listColumns = props.getProperty("listColumns", null);
                    String dateColumns = props.getProperty("dates","");
                    
                    if (componentType.equals("detail") && detailColumns != null) {
                        String formFields = buildDetailFormFields(cols, detailColumns,dateColumns);
                        s = s.replace("%formFields", formFields)
                             .replace("%filename", component);
                        
                    } else if (componentType.equals("list") && listColumns != null) {

                        String listFields = buildListColumns(cols, listColumns,dateColumns);
                        s = s.replace("%listFields",listFields)
                             .replace("%filename", component);
                    }
                }
                
                out = new PrintWriter(filename);
                out.println(s);
                
                //base cass information
            } catch (Exception e) {
                System.out.println("error processing:" + table + " : " + componentType + " : " + ft);
                e.printStackTrace();
            } finally {
                if (out != null) 
                    out.close();
            }
        }
	    return comp;
	}
	
	String buildDetailFormFields (ArrayList<column> cols, String colList, String dateList) {
	    HashMap <String,String> dateDictionary = new HashMap<String,String>();
	    String[] dl = dateList.split(",");
	    for (String d : dl) {
	        dateDictionary.put(d,d);
	    }
        StringBuilder formFields = new StringBuilder();
        try {
            String fTemplate = new String(Files.readAllBytes(Paths.get("templates/detail.column.html")));
            String dTemplate = new String(Files.readAllBytes(Paths.get("templates/detail.column.date.html")));
            String nTemplate = new String(Files.readAllBytes(Paths.get("templates/detail.column.number.html")));
            String bTemplate = new String(Files.readAllBytes(Paths.get("templates/detail.column.boolean.html")));
            
            String[] l = colList.split(",");
            for (String c : l) {
                column col = getColumnByName(cols, c);
                if (col != null) {
                    String tmp = fTemplate;
                    if (dateDictionary.containsKey(col.name)) {
                        tmp = dTemplate;
                    } else if (col.datatype.toLowerCase().contains("bit")) {
                        tmp = bTemplate;
                    } else if (col.datatype.toLowerCase().contains("int")) {
                        tmp = nTemplate;
                    }
                    
                    formFields.append(
                            tmp.replace("%field", getFieldName(col.name))
                                .replace("%label",getLabelName(col.name)));
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return formFields.toString();
	}
	
	
	void createAppModuleAdd() {
	    PrintWriter out=null;
	    try {
            String appTemplate = new String(Files.readAllBytes(Paths.get("templates/app.module.add.ts")));
            String appModuleFilename = (_appFolder + "/app.module.add.ts");
            
            StringBuilder appImports = new StringBuilder();
            StringBuilder appModules = new StringBuilder();
            
            for (Map.Entry<String, String> entry: _appModules.entrySet()) {
                String i = String.format("import { %s } from '%s';\r\n", entry.getKey(), entry.getValue());
                appImports.append(i);
                if (appModules.length() > 0) {
                    appModules.append(", " + entry.getKey());
                } else {
                    appModules.append(entry.getKey());
                }
            }
            String s = appTemplate.replace("%imports",appImports)
                                  .replace("%modules", appModules);
            out = new PrintWriter(appModuleFilename);
            out.print(s);  
        
        } catch (Exception e) {
            System.out.println("error processing app module");
            e.printStackTrace();
        } finally {
            if (out != null) 
                out.close();
        }
        
	}
    column getColumnByName(ArrayList<column>cols, String name) {
        for (column c : cols) {
            if (c.name.equals(name)) {
                return c;
            }
        }
        return null;
    }
    String buildListColumns (ArrayList<column> cols, String colList, String dateList) {
        HashMap <String,String> dateDictionary = new HashMap<String,String>();
        String[] dl = dateList.split(",");
        for (String d : dl) {
            dateDictionary.put(d,d);
        }
        StringBuilder listFields = new StringBuilder();
        try {
            String fTemplate = new String(Files.readAllBytes(Paths.get("templates/list.column.html")));
            String dTemplate = new String(Files.readAllBytes(Paths.get("templates/list.column.date.html")));
            String nTemplate = new String(Files.readAllBytes(Paths.get("templates/list.column.number.html")));
            String bTemplate = new String(Files.readAllBytes(Paths.get("templates/list.column.boolean.html")));        

            String[] l = colList.split(",");
            for (String c : l) {
                column col = getColumnByName(cols, c);
                if (col != null) {
                    String tmp = fTemplate;
                    if (dateDictionary.containsKey(col.name)) {
                        tmp = dTemplate;
                    } else if (col.datatype.toLowerCase().contains("bit")) {
                        tmp = bTemplate;
                    } else if (col.datatype.toLowerCase().contains("int")) {
                        tmp = nTemplate;
                    }                    
                    
                    listFields.append(
                            tmp.replace("%field", getFieldName(col.name)));
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return listFields.toString();
    }	
	String getModelFilename (String tableName) {
		return getFieldName(tableName);
	}

	String getFieldToCol (ArrayList<column> cols) {
		StringBuilder b = new StringBuilder();
		for (column c : cols) {
			if (b.length() > 0) {
				b.append(",");
			}
			b.append(String.format("'%s' => '%s'\r\n", getFieldName(c.name),c.name));
		}
		return b.toString();
	}
	
	String getModelName (String tableName) {
		StringBuilder b = new StringBuilder(tableName);
		int i = 0;
		do {
		  b.replace(i, i + 1, b.substring(i,i + 1).toUpperCase());
		  i =  b.indexOf("_", i) + 1;
		} while (i > 0 && i < b.length());
		return b.toString().replace("_", "");
		
	}
	String getFieldName (String columnName) {
		String s = getModelName (columnName);
		return s.substring(0,1).toLowerCase() + s.substring(1);
	}
	String getLabelName (String columnName) {
	    char[] chars = columnName.toCharArray();
	    chars[0] = Character.toUpperCase(chars[0]);
	    for (int x=1; x < chars.length; x++) {
	        if (chars[x] == '_') {
	            chars[x] = ' ';
	        }
	        if (chars[x-1]==' ') {
	            chars[x] = Character.toUpperCase(chars[x]);
	        }
	    }
	    return new String(chars);
	}
	String getArrayName (String tableName) {
		return "_" + getFieldName(tableName) + "s";
	}
	
	String getIdFieldName (ArrayList<column> cols) {
		for (column c: cols) {
			if (c.isId)
				return getFieldName(c.name);
		}
		//Return the first field if there is no primary key
		//must be a relation table so get by ID doesn't make any sense TODO remove it.
		return getFieldName(cols.get(0).name);
	}
	String getIdColName (ArrayList<column> cols) {
		for (column c: cols) {
			if (c.isId) {
				return c.name;
			}
		}
		return "";
	}
	//Get the angular selector name
	String getSelectorName (String tableName) {
	    String sel = tableName.replace('_', '-').toLowerCase();
	    return sel;
	}
	
	class column {
		public String name;
		public String datatype;
		public boolean isId=false;
	}
}

