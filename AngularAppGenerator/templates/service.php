<?php
require_once '../includes/db.php';
require_once '../includes/cors.php';

require_once '../includes/logdataset.php';
require_once '../includes/cache_refresh.php';

global $dataset;
global $cache_refresh;


class %model {
	var $account_id;
	var $method;
	var $key;
	var $request;
	var $sqlStrings;
	var $input;
	var $sql_conn;
	var $key_field;
	var $sql_get_ext;
	
	var $fieldToCol = array (
%mapFieldToCol
	);
	function __construct($sql_conn) {
		$this->sql_conn = $sql_conn;
		$this->account_id =  $_SERVER['HTTP_ACCOUNTID'];
		
		//$this->account_id = 1;
		$this->sqlString ['select'] = "select %selectfields from %table t %joinStatement where 1=1 %whereacct ";
		$this->sqlString ['selectOrder'] = " %orderby ";
		$this->sqlString ['insert'] = "insert into %table (%s) values (%s) ";
		$this->sqlString ['update'] = "update %table set %s where %idcol = %d ";
		$this->sqlString ['delete'] = "delete from %table where %idcol = %d ";
		$this->key_field = "%idfield";
		$this->sql_get_ext = [];
%sql_get_ext
	}
	
	function setup() {
		
		// get the HTTP method, path and body of the request
		$this->method = $_SERVER ['REQUEST_METHOD'];
		$this->key = "";
		$this->filter_field = "";
		
		if (array_key_exists ( 'PATH_INFO', $_SERVER )) {
		    $this->request = explode ( '/', trim ( $_SERVER ['PATH_INFO'], '/' ) );
		    $this->key = array_shift ( $this->request );

		    if (key_exists($this->key,$this->sql_get_ext)) {
		        $this->key = $this->sql_get_ext[$this->key];
		        $this->filter_field = "";
		    } else if (is_numeric($this->key)) {
		        $this->filter_field = '%idcol';
		    } else {
		        $kv = explode('=', $this->key);
		        // is it a valid field
		        if (array_key_exists($kv[0],$this->fieldToCol)) {
		            $this->filter_field = $this->fieldToCol[$kv[0]];
		            if (is_numeric($kv[1])) {
		                $this->key = $kv[1];
		            } else {
		                $this->key = "'" . $kv[1] . "'";
		            }
		        } else {
		            // Invalid key
		            $this->key = "";
		        }
		    }
		}

		
		$rawdata =file_get_contents ( 'php://input' );
		
		$this->input = json_decode ( $rawdata, true );
		global $dataset;
		$dataset->log($rawdata, '%model');

	}

	function handleRequest() {
		// create SQL based on HTTP method
		switch ($this->method) {
			case 'GET' :
				return $this->get($this->key,$this->filter_field);				
				break;
			case 'PUT' :
				return $this->put($this->input);
				break;
			case 'POST' :
				return $this->post($this->input);
				break;
			case 'DELETE' :
				return $this->delete($this->key);
				break;
		}
	}
	function get($key, $col) {
		//$baseSql = sprintf($this->sqlString['select'], $this->account_id );
		%basesql
		$addlWhere = $key && $col ? " and t.$col=$key" : ($key ? $key : "");
		$sql = $baseSql  . $addlWhere . $this->sqlString['selectOrder'];
		
		$result = $this->sql_conn->query ( $sql) or die($this->sql_conn->error.__LINE__);
		$arr = array();
		if ($result->num_rows > 0) {
			while ( $row = $result->fetch_assoc () ) {
//%NoMoreChildren_getChildren
				$arr [] = $row;			
			}
		}
		// If we are pulling the primary key object then return the single item not an array
		if ($key != '' && $col == '%idcol' && count($arr) > 0) {
		    if (count($arr) > 0) {
			   return $arr[0];
		    } else {
		       return (Object) null; 
		    }
		}
		return $arr;
		
	}
	function post($data) {
		//get the direct data
		//$key_field="%idfield";

		//Force the current account if there is an accountId field on the object
		if (array_key_exists("accountId", $this->fieldToCol)) {
			$data["accountId"] = $this->account_id;
		}
				
		$len = count($data);
	
		$keys = preg_replace('/[^a-z0-9_]+/i','',array_keys($data)) ;
		$sql_conn = $this->sql_conn;
		$values = array_map(function ($v) use ($sql_conn) {
			if ($v===null) return null;
			if (is_array($v)) return $v;
			return $sql_conn->real_escape_string((string)$v);
		},array_values($data));
	
		$cols = "";
		$vals = "";
		for ($i=0; $i<$len;$i++) {
			if (array_key_exists($keys[$i],$this->fieldToCol) &&
					!is_array($values[$i])) {
				//don't add a comma if this is a key field this is a problem
				//if the key field is not the first in the list
				if (strlen($cols) > 0 && $keys[$i] != $this->key_field) {
					$cols .= ",";
					$vals .= ",";
				}
				if ($keys[$i] != $this->key_field) {
					$cols .= $this->fieldToCol[$keys[$i]];
					if ($values[$i]===null) {
						$vals .= 'NULL';
					} else {
						$vals .=  is_numeric($values[$i]) ? $values[$i] : '"'.$values[$i].'"';
					}										
				}
			}
		}

		$sql_stmt = sprintf(($this->sqlString['insert']),$cols, $vals);
		//echo $sql_stmt;
		$result = $this->sql_conn->query ($sql_stmt) or die($this->sql_conn->error.__LINE__);
		$insert_id= $this->sql_conn->insert_id;
		global $cache_refresh;
		$cache_refresh->update($this->sql_conn,$this->account_id,'%model');
		// Now process the children
		//Need to replace the key field value as well
		
//%NoMoreChildren_postChildren
		if (%retSource) {
			$data[$this->key_field] = $insert_id;
			return $data;				
		}
		return $this->get($insert_id, '%idcol');
		//return $data;
	}

	function put($data) {
		//get the direct data
		//$key_field="%idfield";
		$len = count($data);
	
		$keys = preg_replace('/[^a-z0-9_]+/i','',array_keys($data)) ;
		$sql_conn = $this->sql_conn;
		$values = array_map(function ($v) use ($sql_conn) {
			if ($v===null) return null;
			if (is_array($v)) return $v;
			return $sql_conn->real_escape_string((string)$v);
		},array_values($data));
	
			$set = "";
			$key_value = -1;
			for ($i=0; $i<$len;$i++) {
				if (array_key_exists($keys[$i],$this->fieldToCol) &&
					!is_array($values[$i])) 
				{
					if (strlen($set) > 0) {
						$set .= ",";
					}
					if ($keys[$i] != $this->key_field) {
						$set .= $this->fieldToCol[$keys[$i]] . "=";
						if ($values[$i]===null) {
							$set .= 'NULL';
						} else {
							$set .=  is_numeric($values[$i]) ? $values[$i] : '"'.$values[$i].'"';
						}
					} else {
						// set the key value
						$key_value = $values[$i];
					}
				}
			}

			$sql_stmt = sprintf(($this->sqlString['update']),$set, $key_value);
			//echo $sql_stmt . "<br>";
			$result = $this->sql_conn->query ($sql_stmt) or die($this->sql_conn->error.__LINE__);
			global $cache_refresh;
			$cache_refresh->update($this->sql_conn,$this->account_id,'%model');
			// Now process the children
			//Need to replace the key field value as well
//%NoMoreChildren_saveChildren
			if (%retSource) {
				return $data;
			}
			
			return $this->get($key_value, '%idcol');
			//return $data;
	}
	
	function delete ($data) {
		//If this is -1 then we can't delete it
		
		//Is delete allowed on this object
		if (is_array($data)) {
			$key_value = $data[$this->key_field];
		} else {
			$key_value = $data;
		}
		if ($key_value) {
			$obj = $this->get($key_value, '%idcol');
			$sql_stmt = sprintf(($this->sqlString['delete']), $key_value);
			$result = $this->sql_conn->query ($sql_stmt);
			global $cache_refresh;
			$cache_refresh->update($this->sql_conn,$this->account_id,'%model');
			if ($result) {
				return $obj;
			}
		}
		return array('status' => 'false');
	}	
	
	function save($data) {
		//are we creating, updating or deleting
		$key_field="%idfield";
		$key_val = $data[$key_field];
		$deleted = FALSE;
		if (array_key_exists('deleted', $data)) {
			$deleted = $data['deleted'];
		}
		if ($key_val == -1) {
			return $this->post($data);
		} else if ($deleted == TRUE) {
			return $this->delete($data);
		} else {
			return $this->put($data);
		}
	}	

}

?>