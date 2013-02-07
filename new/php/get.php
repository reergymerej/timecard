<?php

//	GET = read
require 'connect.php';
$con = connect();

//	what was requested?
// api/Task/?start=1234&end=999
$request = $_SERVER['REQUEST_URI'];

//	Are there params?
if( strpos($request, '?') ){
	//	remove params from $request
	$request = explode('?', $request);
	$request = $request[0];
};


//	split request into components
$request = explode( '/', substr( $request, strpos( $request, 'api' ) + 4 ) );
$noun = $request[0];
if(trim($request[1]) !== ''){
	$id = mysql_real_escape_string($request[1]);
};

//	TODO This should not be hard-coded.
$user_id = 0;

//	select from DB
$sql = "SELECT id, start, end, duration, label FROM task ";

if(isset($id)){
	//	get single object
	$sql .= "WHERE user_id = $user_id AND id = $id;";

} elseif( isset( $_GET['running'] ) ) {
	//	get a collection of running tasks
	$sql .= "WHERE user_id = $user_id AND end IS NULL ORDER BY start;";

} else {
	//	get collection between start and end
	$start = mysql_real_escape_string($_GET['start']);
	$end = mysql_real_escape_string($_GET['end']);
	$sql .= "WHERE user_id = $user_id AND start >= $start AND start <= $end ORDER BY start DESC;";
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