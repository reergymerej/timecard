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

	$sql = "SELECT category, sum(duration) AS duration FROM task ";
	$sql .= "WHERE start >= $start  AND end <= $end ";
	$sql .= "AND user_id = $user_id AND duration > 0 ";
	$sql .= "GROUP BY category ORDER BY sum(duration) DESC;";

	//	execute query
	$result = mysql_query( mysql_real_escape_string($sql) );
	$data = array();

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