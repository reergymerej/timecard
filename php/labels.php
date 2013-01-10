<?php

	require('connect.php');

	//	prepare data
	$responseMessage = '';
	
	//	connect to db
	$con = connect();
	if(is_string($con)){
		respond(false, $con);
		die();
	};


	/******************************************************************/
	//	load saved tasks

	$sql = "SELECT distinct(category) FROM `task` ORDER BY category";

	//	execute query
	$result = mysql_query( mysql_real_escape_string($sql) );
	$data = array();

	if(mysql_error()){
		$responseMessage .= $sql . "\n";
		$responseMessage .= 'error loading labels: ' . mysql_error() . "\n";
		respond(false, $responseMessage);
		die();
	} else {
		$responseMessage .= 'labels loaded: ' . mysql_num_rows($result) . "\n";

		while( $row = mysql_fetch_array($result, MYSQL_ASSOC) ){
			array_push($data, $row['category']);
		};
	};


	/******************************************************************/
	//	send response to client
	respond(true, $responseMessage, $data);


	/**
	* Send response to client as JSON.
	* @param {boolean} status
	* @param {string} [message]
	**/
	function respond($status, $message, $data = null){
		$response = (object)array(
			'status' => $status,
			'message' => $message,
			'data' => $data
		);

		echo json_encode($response);
	};
?>