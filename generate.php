<?php

function timerStart() {
	return microtime_float();
}

function timer($start) {
	return microtime_float() - $start;
}

function microtime_float() {
	list($usec, $sec) = explode(' ', microtime());
	return ((float)$usec + (float)$sec);
}


$start = timerStart();
generate();
$table = $result;
$givens = 81;
$triedremoving = array();
for ($y = 0; $y < 9; $y++) {
	for ($x = 0; $x < 9; $x++) {
		$triedremoving[] = array($x, $y);
	}
}
shuffle($triedremoving);

while (sizeof($triedremoving)) {
	$coords = $triedremoving[sizeof($triedremoving) - 1];

	unset($triedremoving[sizeof($triedremoving) - 1]);
	$triedremoving = array_values($triedremoving);
	$x = $coords[0];
	$y = $coords[1];

	$x2 = 8 - $x;
	$y2 = 8 - $y;

	$table[$x][$y] = null;
	$table[$x2][$y2] = null;
	$givens--;
	$givens--;
	$solutions = solve();

	if ($solutions > 1) {
		$table[$x][$y] = $result[$x][$y];
		$table[$x2][$y2] = $result[$x2][$y2];
		$givens++;
	}
}

//header('Content-type: application/json');
header('Content-type: text/plain');
dumpTable($table);

function generate() {
	global $table, $solved, $result;
	$table = array_fill(0, 9, array_fill(0, 9, null));
	$result = $table;
	populateCell(0);
}

function populateCell($index) {
	global $table, $result, $killsig;

	if ($index == 81) {
		$killsig = true;
		$result = $table;
	}

	if ($killsig) {
		return true;
	}

	$y = floor($index / 9);
	$x = $index - $y * 9;

	$allowed=allowed($table, $index);
	if ($allowed) {
		$allowed = str_split($allowed, 1);
		shuffle($allowed);

		foreach ($allowed as $try) {
			$table[$x][$y] = $try;
			populateCell($index + 1);
		}
		$table[$x][$y] = null;
	} else {
		return false;
	}
}

function dumpTable($tab) {
	$out = '';
	$givens = 0;
	for ($y = 0; $y < 9; $y++) {
		$out .= "\n\t[";
		for ($x = 0; $x < 9; $x++) {
			if ($tab[$x][$y]) {
				$givens++;
				$out .= $tab[$x][$y];
			}
			else $out .= 0;
			$out .= ',';
		}

		$out = substr($out, 0, -1) . "],";
	}

	$out = substr($out, 0, -1);

	echo "{"
	."\"givens\":$givens,"
	."\"grid\":["
	.$out
	."\n]}";
}

function solve() {
	global $table, $solved;
	$solved = $table;

	$t = array();
	for ($y = 0; $y < 9; $y++) {
		for ($x = 0; $x < 9; $x++) {
			if (!$table[$x][$y]) $t[] = array($x, $y);
		}
	}

	$method1over=false;
	while (!$method1over and sizeof($t)) {
		$method1over = true;

		for ($i = 0; $i < sizeof($t); $i++) {
			$x = $t[$i][0];
			$y = $t[$i][1];

			$al = allowed($solved, $x + $y * 9);
			if (strlen($al) == 1) {
				$solved[$x][$y] = $al;
				unset($t[$i]);
				$method1over = false;
				//break;
			}
		}
		$t = array_values($t);
	}

	$full = 81 - sizeof($t);
	unset($t);

	if ($full < 81) {
		// NOT UNIQUE
		return 2;
	} else if ($full == 81) {
		// UNIQUE
		return 1;
	}
}

function allowed($t, $index) {
	$y = floor($index / 9);
	$x = $index - $y * 9;

	$chekCells = array();

	for ($x2 = 0; $x2 < 9; $x2++) {
		if ($x2 != $x) $checkCells[] = array($x2, $y);
	}

	for ($y2 = 0; $y2 < 9; $y2++) {
		if ($y2 != $y) $checkCells[] = array($x, $y2);
	}

	$qx = floor($x / 3) * 3;
	$qy = floor($y / 3) * 3;

	for ($y2 = $qy; $y2 < $qy + 3; $y2++) {
		for ($x2 = $qx; $x2 < $qx + 3; $x2++) {
			if ($x2 != $x) $checkCells[] =array($x2, $y2);
		}
	}

	$exclude = '';
	foreach ($checkCells as $h => $cell) {
		$exclude .= $t[$cell[0]][$cell[1]];
	}

	$exclude = implode(array_unique(str_split($exclude)));

	unset($checkCells);

	$possible = '123456789';
	if (strlen($exclude) == 9) {
		$ret = '';
	} else if (strlen($exclude) == 0) {
		$ret = $possible;
	} else {
		$ret = preg_replace('/[' . $exclude . ']/', '', $possible);
	}

	return $ret;
}

function randDigit($possible) {
	return $possible[rand(0, strlen($possible) - 1)];
}
