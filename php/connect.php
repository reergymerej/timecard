<?php
	
	function connect(){
		$user = 'wordtoth_visitor';
		$server = 'wordtotheblurd.com';
		$password = 'visitor';
		$db = 'wordtoth_timecard';
		
		if($connection = @mysql_connect($server, $user, $password)){
			if(mysql_select_db($db)){
				return $connection;
			} else {
				return 'unable to select db';
			}
		} else {
			return 'unable to connect to db server';
			die();
		};
	};

?>