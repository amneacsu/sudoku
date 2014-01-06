<?php

//header('Content-type: text/plain; charset=ISO-8859-1');
ini_set('display_errors', 'On');
include 'config.php';

mysql_connect($sql['hostname'], $sql['username'], $sql['password']);
mysql_Select_db($sql['database']);

if (isset($_POST['op'])) $op = $_POST['op'];
else die();

if ($op == 'set') {
	foreach (array('playername', 'time', 'givens') as $h) {
		if (isset($_POST[$h])) $$h = $_POST[$h];
		else die();
	}
	if ($time > 15 or 1) {
		$query = "INSERT INTO score_sudoku (playername, time, address, referer, givens) VALUES ('$playername', $time, '" . $_SERVER['REMOTE_ADDR'] . "', '" . $referer = $_SERVER['HTTP_REFERER'] . "', $givens)";
		mysql_query($query);
	}
} else if ($op == 'get') {
	if (isset($_POST['count'])) $count = $_POST['count'];
	else die();

	if (isset($_POST['page'])) $page = $_POST['page'];
	else die();

	$query = "SELECT playername, time FROM score_sudoku ORDER BY time LIMIT " . ($page - 1) * $count . ", $count";
	$select = mysql_query($query);
	$output = '';
	for ($i = 0; $i < mysql_num_rows($select); $i++) {
		$row = mysql_fetch_assoc($select);
		$output .= "{\"playername\":\"$row[playername]\",\"time\":\"$row[time]\"},";
	}

	echo '[' . substr($output, 0, -1) . ']';
}
