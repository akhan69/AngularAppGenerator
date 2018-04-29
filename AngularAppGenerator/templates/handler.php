<?php
require_once '../includes/db.php';
require_once '../includes/cors.php';
require_once '../includes/requestData.php';

%include

$requestData = new RequestData();

if (%blockwebrequest) {
	header('HTTP/1.0 400 Bad Request');
	return;
}


if ($requestData->isError()) {
	header('HTTP/1.0 401 Unauthorized');
	return;
}

%capabilityRequirements

$method = $_SERVER ['REQUEST_METHOD'];
if (!$requestData->validateCapabilities($method,$capReq)) {
    system_log::log($mysqli, $requestData->accountId, $requestData->userId,
        system_log::$SEV_ERROR,system_log::$SRC_WEB,system_log::$CAT_SEC,"Illegal action attempted : $method");
    
    header('HTTP/1.0 405 Method Not Allowed');
    return;
}

$handler = new %model($mysqli);
$handler->setup();
$response_arr = $handler->handleRequest();
echo $json_response = json_encode ( $response_arr, JSON_NUMERIC_CHECK );

?>