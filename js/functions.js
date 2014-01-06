$(function() {
	$.extend($.fn.disableTextSelect = function() {
		return this.each(function() {
			if ($.browser.mozilla) { //Firefox
				$(this).css('MozUserSelect', 'none');
			} else if ($.browser.msie) { //IE
				$(this).bind('selectstart', function() {
					return false;
				});
			} else {//Opera, etc.
				$(this).mousedown(function() {
					return false;
				});
			}
		});
	});
	$('#grid').disableTextSelect();
	//No text selection on elements with a class of 'noSelect'
});

/* * /
function alert(str) {
	console.log(str);
}
/* */

var startTime;

function getBench(reset) {
	var endTime = new Date().getTime();
	var out = ((endTime - startTime) / 1000) + 's';
	if (reset) {
		startTime = endTime;
	}
	return out;
}

Array.prototype.indexOf = function(v, b, s) {
	for (var i = +b || 0, l = this.length; i < l; i++) {
		if (this[i] === v || s && this[i] == v) {
			return i;
		}
	}
	return -1;
}

Array.prototype.unique = function(b) {
	var a = [], i, l = this.length;
	for (i = 0; i < l; i++) {
		if (a.indexOf(this[i], 0, b) < 0) {
			a.push(this[i]);
		}
	}
	return a;
};

String.prototype.leftPad = function(l, c) {
	return new Array(l - this.length + 1).join(c || '0') + this;
}
