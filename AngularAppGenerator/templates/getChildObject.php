				$cls = new %class($this->sql_conn);
				$a = $cls->get($row['%idfield'], "%idcol");
				$row['%classs'] = $a;				
