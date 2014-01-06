var game = {
	scoreboard_size: 10,
	grid: null,
	time: 0,
	timer: null,
	cookie_playername: 'anti_sudoku_playername'
};

jQuery.hookevents = function() {

	$('a[rel~=scores]').click(function() {
		var rel = $(this).attr('rel').split(' ')[1];
		var currentpage = $('#scores').data('page');
		var newpage = currentpage + (rel == 'next' ? 1 : -1);

		if (newpage > 0 && newpage <= 10) {
			$('#scores').trigger('loadpage', [newpage]);
		}
	})

	$('#scores').bind('loadpage', function(event, page) {
		$.loadScorePage(page, game.scoreboard_size, function(data) {
			var $s = $('#scores');
			var offs = (page - 1) * game.scoreboard_size;

			$s.find('.scorelist').empty();
			var scorelist = document.createDocumentFragment();
			for (var i = 0; i < game.scoreboard_size; i++) {
				var scr = '';
				if (i < data.length) {
					var m = String(Math.floor(data[i].time / 60));
					var s = String(data[i].time % 60);
					scr = m.leftPad(2) + ':' + s.leftPad(2)
				}
				var row = $('<div>').append(
					$('<u>' + (i + 1 + offs) + '</u>' + (i < data.length ? '<b>' + data[i].playername + '</b><i>' + scr + '</i>' : ''))
				);
				scorelist.appendChild(row[0]);
			}

			$s.find('.scorelist')[0].appendChild(scorelist);
			$s.data('page', page).trigger('center').fadeIn();
		});
	}).disableTextSelect();

	$('#menu').width(240).find('a').click(function() {
		var op = $(this).attr('rel');
		$('#menu').fadeOut();
		if (op == 'newgame') $.getgrid($.buildgrid);
		if (op == 'highscores') $.showScores();
		if (op == 'about') $.showAbout();
		if (op == 'resumegame') {
			$('#time').trigger('start');
			$('#game').parent().fadeIn();
		}
	});

	$('a.mainmenu').live('click', function() {
		$('#time').trigger('stop');
		$('.bubble').fadeOut(function() {
			$('#menu').fadeIn();
		});
	});

	$(document).keyup(function(event) {

		var selection = $('#game').find('div.selected');

		if (selection.length > 0 && !selection.hasClass('given')) {
			var k = event.which;
			if (event.keyCode == 46) k = 48;

			if ((k >= 48 && k <= 57) || (k >= 97 && k <= 105)) {
				var k2 = k - 48;
				if (k > 57) k2 -= 48;
				selection.setValue(k2);
			} else if (k == 48 || k == 32 || k == 96) {
				selection.setValue(0);
			}
		}

		var k = event.keyCode;

		if (k >= 37 && k <= 40) {
			var $cells = $('#game div');
			var indx = selection.prevAll().length;
			var x = indx % 9 + 1;
			var y = Math.floor((indx) / 9) + 1;
			var $n;
			switch (k) {
				case 38: if (y > 1) $n = $cells.eq(indx - 8); break; // arrow up
				case 40: if (y < 9) $n = $cells.eq(indx + 10); break; // arrow down
				case 37: if (x > 1) $n = selection.prev(); break; // arrow left
				case 39: if (x < 9) $n = selection.next(); break; // arrow right
				default: break;
			}

			if ($n) {
				selection.removeClass('selected');
				$n.addClass('selected');
			}
		}
	});

	$('.bubble').live('center', function() {
		var p = parseInt($(this).css('paddingLeft'), 10);
		$(this).css({
			marginLeft: '-' + ($(this).width() + p * 2) / 2 + 'px',
			marginTop: '-' + ($(this).height() + p * 2) / 2 + 'px'
		});
	});

	$('#time').bind('start', function() {
		game.timer = setInterval($.tick, 1000);
		$('#game div').eq(41).mouseover();
	}).bind('stop', function() {
		clearTimeout(game.timer);
	});
}

jQuery.fn.setValue = function(v) {
	return this.each(function() {
		$(this).html(v === 0 ? ' ' : v);
		var index = $(this).prevAll().length;
		game.grid[index % 9][Math.floor(index / 9)] = v;
		$.checkGrid();
	});
}

jQuery.checkGrid = function() {
	$('#game div').removeClass('conflict');
	var v1, v2;
	getBench(true);
	var conflicts = [];
	for (var y = 0; y < 9; y++) {
		for (var i = 0; i < 9; i++) {
			for (var j = 0; j < 9; j++) {

				if (i != j) {
					v1 = game.grid[i][y];
					v2 = game.grid[j][y];
					if (v1 == v2 && v1) {
						//conflicts.push([i,y]);
						conflicts.push([j, y]);
					}

					v1 = game.grid[y][i];
					v2 = game.grid[y][j];
					if (v1 == v2 && v1) {
						conflicts.push([y, i]);
						conflicts.push([y, j]);
					}
					var qy = Math.floor(y / 3); var qx = y % 3;
					var qy2 = Math.floor(i / 3) + qy * 3; var qx2 = i % 3 + qx * 3;
					var qy3 = Math.floor(j / 3) + qy * 3; var qx3 = j % 3 + qx * 3;

					v1 = game.grid[qx2][qy2];
					v2 = game.grid[qx3][qy3];
					if (v1 == v2 && v1) {
						conflicts.push([qx2, qy2]);
						conflicts.push([qx3, qy3]);
					}
				}
			}
		}
	}

	conflicts = conflicts.unique();
	var d = $('<div></div>');
	for (var i = 0; i < conflicts.length; i++) {
		$.getCell(conflicts[i][0], conflicts[i][1]).addClass('conflict');
	}

	d.addClass('conflict');

	var moves = false;
	for (var y = 0; y < 9; y++) {
		t = game.grid[y].join('');
		if (t.indexOf('0') > -1) {
			moves = true;
		}
	}

	if (conflicts.length == 0 && !moves) {
		$.gameEnd();
	}
}

jQuery.getCell = function(x,y) {
	return $('#grid div').eq(y * 9 + x);
}

jQuery.getgrid = function(callback) {
	$.ajax({
		url: 'generate.php',
		dataType: 'json',
		success: callback
	});
}

jQuery.buildgrid = function(data) {
	$.extend(game, data);
	game.time = 0;
	$('#time').html('00:00');
	$('a[rel~=resumegame]').css('display', 'block');

	var frag = document.createDocumentFragment();
	for (var y = 0; y < 9; y++) {
		for (var x = 0; x < 9; x++) {
			var cell=$('<div></div>');
			//if (x == 0) cell.css('clear', 'both');
			if (data.grid[x][y] > 0) {
				cell.html(data.grid[x][y]).addClass('given');
			}

			if (x % 3 == 0 && x > 0) {
				cell.css('border-left-width', '2px');
			}
			if (y % 3 == 0 && y > 0) {
				cell.css('border-top-width', '2px');
			}

			frag.appendChild(cell[0]);
		}
		frag.appendChild(cell[0]);
	}

	var $grid = $('#grid');

	$grid.empty();

	$grid.mouseover(function(event) {
		var $tile = $(event.target);
		$tile.addClass('over').siblings().removeClass('over');
	});

	$grid.click(function(event) {
		var $tile = $(event.target);
		if (this != event.target && !$tile.hasClass('given')) {
			$tile.addClass('selected').siblings().removeClass('selected');
		}
	});

	$grid[0].appendChild(frag);

	$('#game').parent().width(310).trigger('center').fadeIn(function() {
		$('#time').trigger('start');
	});

}

jQuery.startTimer = function() {
	game.timer = setInterval($.tick, 1000);
}

jQuery.tick = function() {
	game.time++;
	var m = String(Math.floor(game.time / 60));
	var s = String(game.time % 60);
	$('#time').html(m.leftPad(2) + ':' + s.leftPad(2));
}
