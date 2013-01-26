<?php

//	GET = read
require 'connect.php';
$con = connect();

//	what was requested?
$request = $_SERVER['REQUEST_URI'];
$request = explode( '/', substr( $request, strpos( $request, 'api' ) + 4 ) );

$noun = $request[0];
$id = mysql_real_escape_string($request[1]);
$user_id = 0;

//	select from DB
$sql = "SELECT id, start, end, duration, label FROM task ";
$sql .= "WHERE user_id = $user_id AND id = $id;";
$result = mysql_query($sql);

if(mysql_error()){
	return;
};

//	convert row to JSON
$row = mysql_fetch_assoc($result);
echo json_encode($row);
?>