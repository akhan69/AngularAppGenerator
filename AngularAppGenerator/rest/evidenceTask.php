<?php
require_once '../includes/db.php';
 

// get the HTTP method, path and body of the request
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
$input = json_decode(file_get_contents('php://input'),true);
 
// connect to the mysql database
$link = mysqli_connect('localhost', 'user', 'pass', 'dbname');
mysqli_set_charset($link,'utf8');

$sql_select = "select task_id as taskId, Account_id as accountId, description as description, task_UUID as taskUUID, taskcode as taskcode, active as active, warnwindow as warnwindow, criticalwindow as criticalwindow, notifyon as notifyon, lastgeneration as lastgeneration, frequency as frequency, startdate as startdate, currentstate as currentstate, pretestadvancedays as pretestadvancedays, ispassfail as ispassfail, pretest as pretest, needattestation as needattestation  from evidence_task where account_id=$account_id ".($key?" and %idcol=$key":'')
$sql_insert = "insert into evidence_task values (%colList) (%valList)"

$sql_update = ""

// escape the columns and values from the input object
$columns = preg_replace('/[^a-z0-9_]+/i','',array_keys($input));

$values = array_map(function ($value) use ($link) {
  if ($value===null) return null;
  return mysqli_real_escape_string($link,(string)$value);
},array_values($input));

$set = '';
for ($i=0;$i<count($columns);$i++) {
  $set.=($i>0?',':'').'`'.$columns[$i].'`=';
  $set.=($values[$i]===null?'NULL':'"'.$values[$i].'"');
}

// create SQL based on HTTP method
switch ($method) {
  case 'GET':
    $sql = "select * from `evidence_task`".($key?" WHERE id=$key":''); break;
  case 'PUT':
    $sql = "update `$table` set $set where id=$key"; break;
  case 'POST':
    $sql = "insert into `$table` set $set"; break;
  case 'DELETE':
    $sql = "delete `$table` where id=$key"; break;
}







?>

