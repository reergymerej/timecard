<?php

//	POST = create
require 'connect.php';
$con = connect();

//	get PUT variables
// parse_str( file_get_contents("php://input"), $put );
$put = file_get_contents("php://input");
$put = json_decode($put);

//	find noun & id
$request = $_SERVER['REQUEST_URI'];
$request = explode( '/', substr( $request, strpos( $request, 'api' ) + 4 ) );
$noun = $request[0];
$id = mysql_real_escape_string($request[1]);

if( is_null($id) ){
	echo "id missing";
	return;
};

//	get variables
//	TODO this should eventually not be tied to Tasks so we can reuse this script for other objects
// foreach($put as $var => $val){
// 	echo $var . ": " . $val;
// };
$sql = "UPDATE task SET ";
foreach($put as $name => $val){
	$sql .= getVal($put, $name);
};

//	remove last ,
$sql = substr($sql, 0, strrpos($sql, ',')) . " ";
$sql .= "WHERE id = $id;";

//	update in DB
$result = mysql_query($sql);
if(mysql_error()){
	return false;
} else {
	//echo mysql_affected_rows();
};



function getVal($put, $varName){
	if( isset($put->{$varName}) ){
		return "$varName = '" . mysql_real_escape_string($put->{$varName}) . "', ";
	};
};
?>