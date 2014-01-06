$(document).ready(function() {
	$.hookevents();
	$('#menu').trigger('center').fadeIn();
});

jQuery.showScores = function() {
	$('#scores').width(300).trigger('loadpage', [1]).trigger('center').fadeIn();
}

jQuery.showAbout = function() {
	$('#about').width(340).trigger('center').fadeIn();
}

jQuery.submitScore = function() {
	$('#playername, #submitscore').unbind();
	var playername=$('#playername').val();
	var time = game.time;
	$.cookie(game.cookie_playername,playername);

	$.ajax({
		url: 'score.php',
		type: 'POST',
		data: {
			op: 'set',
			playername: playername,
			time: time,
			givens: game.givens
		},
		success: function() {
			$('#playername').closest('.bubble').fadeOut();
			$.showScores();
		}
	});
}

jQuery.gameEnd = function() {
	$('a[rel~=resumegame]').css('display', 'none');
	$('#time').trigger('stop');
	$('#game').parent().fadeOut();

	var c = $.cookie(game.cookie_playername);

	$('#submitscore').find('a.button').click($.submitScore).end()
	.find('input').keyup(function(event) {
		if (event.which == 13) {
			$.submitScore();
		}
	}).val(c ? c : 'Anonymous')
	.end().trigger('center').fadeIn(function() {
		$(this).find('input').focus().select();
	});
}

jQuery.loadScorePage = function(page, limit, callback) {
	$.ajax({
		url: 'score.php',
		type: 'POST',
		data: {
			op: 'get',
			page: page,
			count: limit
		},
		dataType: 'json',
		success: callback
	});
}
