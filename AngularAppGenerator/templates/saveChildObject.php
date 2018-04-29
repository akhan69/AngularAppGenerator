		if (array_key_exists('%classs',$data)) {
			$child_obj = $data['%classs'];
			$len = count($child_obj);
			
			for ($i=0; $i < $len; $i++) {		
				$child_obj[$i]['%idfield'] = $key_value;
				$cls = new %class($this->sql_conn);
				$cls->save($child_obj[$i]);
			}
		}
