<?php

	require('connect.php');

	//	prepare data
	$tasks = $_POST['tasks'];
	$timeframe = $_POST['timeframe'];
	$responseMessage = '';

	//	DEBUG
	/*
	print_r($_POST);
	print_r($tasks);
	print_r($timeframe);
	*/

	//	connect to db
	$con = connect();
	if(is_string($con)){
		respond(false, $con);
		die();
	};


	/******************************************************************/
	//	delete those already saved in this timeframe
	$start 		= $timeframe['start'];
	$end 		= $timeframe['end'];
	$user_id 	= $timeframe['userID'];

	$sql = "DELETE FROM task ";
	$sql .= "WHERE start >= $start AND end <= $end AND user_id = $user_id";

	//	execute query
	$result = mysql_query($sql);
	if(mysql_error()){
		$responseMessage .= $sql . "\n";
		$responseMessage .= 'error deleting old tasks: ' . mysql_error() . "\n";
		respond(false, $responseMessage);
		die();
	} else {
		$responseMessage .= 'old tasks deleted: ' . mysql_affected_rows() . "\n";
	};


	/******************************************************************/
	//	save the new ones
	$sql = "INSERT INTO task (start, end, duration, category, user_id) VALUES ";

	foreach($tasks as $t){
		$start 		= $t['start'];
		$end 		= isset($t['end']) ? $t['end'] : 0;
		$duration 	= isset($t['duration']) ? $t['duration'] : 0;
		$category 	= $t['category'];

		$sql .= "($start, $end, $duration, '$category', $user_id), ";
	};

	//	remove last ,
	$sql = substr($sql, 0, strlen($sql) - 2);

	//	execute query
	$result = mysql_query($sql);
	if(mysql_error()){
		$responseMessage .= $sql . "\n";
		$responseMessage .=  'error inserting new tasks: ' . mysql_error();
		respond(false, $responseMessage);
		die();
	} else {
		$responseMessage .= 'new tasks inserted: ' . mysql_affected_rows() . "\n";
	};
	
	
	/******************************************************************/
	//	send response to client
	respond(true, $responseMessage);


	/**
	* Send response to client as JSON.
	* @param {boolean} status
	* @param {string} [message]
	**/
	function respond($status, $message){
		$response = (object)array(
			'status' => $status,
			'message' => $message
		);

		echo json_encode($response);
	};
?>