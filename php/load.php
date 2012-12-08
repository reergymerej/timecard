<?php

	require('connect.php');

	//	prepare data
	$timeframe = $_POST['timeframe'];
	$responseMessage = '';
	
	//	connect to db
	$con = connect();
	if(is_string($con)){
		respond(false, $con);
		die();
	};


	/******************************************************************/
	//	load saved tasks
	$start 		= $timeframe['start'];
	$end 		= $timeframe['end'];
	$user_id 	= $timeframe['userID'];

	$sql = "SELECT start, end, duration, category FROM task ";
	$sql .= "WHERE start >= $start AND end <= $end AND user_id = $user_id ORDER BY start";

	//	execute query
	$result = mysql_query($sql);
	$data = [];

	if(mysql_error()){
		$responseMessage .= $sql . "\n";
		$responseMessage .= 'error loading tasks: ' . mysql_error() . "\n";
		respond(false, $responseMessage);
		die();
	} else {
		$responseMessage .= 'tasks loaded: ' . mysql_num_rows($result) . "\n";

		while( $row = mysql_fetch_array($result, MYSQL_ASSOC) ){
			array_push($data, $row);
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