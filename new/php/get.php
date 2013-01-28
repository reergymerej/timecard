<?php

//	GET = read
require 'connect.php';
$con = connect();

//	what was requested?
$request = $_SERVER['REQUEST_URI'];

//	Are there params?
$paramIndex = strpos($request, '?');
if($paramIndex !== false){
	//	remove params from $request
	$request = substr($request, 0, strpos($request, '?'));
};

//	split request into components
$request = explode( '/', substr( $request, strpos( $request, 'api' ) + 4 ) );
$noun = $request[0];
if($request[1] !== ''){
	$id = mysql_real_escape_string($request[1]);
};

$user_id = 0;

//	select from DB
$sql = "SELECT id, start, end, duration, label FROM task ";

if(isset($id)){
	//	get single object
	$sql .= "WHERE user_id = $user_id AND id = $id;";
} else {
	//	get collection
	$start = mysql_real_escape_string($_GET['start']);
	$end = mysql_real_escape_string($_GET['end']);
	$sql .= "WHERE user_id = $user_id AND start >= $start ORDER BY start;";
};

$result = mysql_query($sql);

if(mysql_error()){
	return;
};

$rows = mysql_num_rows($result);
if($rows === 0){
	header('HTTP/1.0 404 Not Found');
	return;	
} elseif( $rows === 1){
	$row = mysql_fetch_assoc($result);
	echo json_encode($row);
} else {
	$rows = array();
	while($row = mysql_fetch_assoc($result)){
		array_push($rows, $row);
	};
	echo json_encode($rows);
};
?>