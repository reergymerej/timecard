<?php



//	POST = create

require 'connect.php';

$con = connect();



//	convert from JSON in payload to object

$post = file_get_contents("php://input");

$post = json_decode($post);





//	find noun

$request = $_SERVER['REQUEST_URI'];

$request = explode( '/', substr( $request, strpos( $request, 'api' ) + 4 ) );

$noun = $request[0];



//	get variables

//	TODO this should eventually not be tied to Tasks so we can reuse this script for other objects

$start = mysql_real_escape_string($post->start);

$label = mysql_real_escape_string($post->label);

$user_id = 0;



//	insert to DB

$sql = "INSERT INTO task (start, label, user_id) ";

$sql .= "VALUES ($start, '$label', $user_id);";

$result = mysql_query($sql);



if(mysql_error()){
	return;
};



//	TODO convert to JSON rather than making it manually

echo '{"id":' . mysql_insert_id() . '}';

?>