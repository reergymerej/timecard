<?php

//	DELETE = delete
require 'connect.php';
$con = connect();

//	what was requested?
$request = $_SERVER['REQUEST_URI'];
$request = explode( '/', substr( $request, strpos( $request, 'api' ) + 4 ) );

$noun = $request[0];
$id = mysql_real_escape_string($request[1]);

if( is_null($id) ){
	echo "id missing";
	return;
};

$sql = "DELETE FROM task ";
$sql .= "WHERE id = $id;";

//	delete from DB
$result = mysql_query($sql);
if(mysql_error()){
	header('HTTP/1.0 404 Not Found');
	return;
} else {
	$rows = mysql_affected_rows();
	if($rows === 0){
		header('HTTP/1.0 404 Not Found');
		return;
	};
	echo $rows;
};
?>