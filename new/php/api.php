<?php

$request = $_SERVER['REQUEST_URI'];

//	what are we doing?
$verb = $_SERVER['REQUEST_METHOD'];

switch($verb){

	//	create
	case 'POST':
		require('post.php');
		break;

	//	read
	case 'GET':
		require('get.php');
		break;

	//	update
	case 'PUT':
		require('put.php');
		break;

	//	delete
	case 'DELETE':
		require('delete.php');
		break;

	default:
		echo "What the hell are you talking about?";
		break;
};

?>