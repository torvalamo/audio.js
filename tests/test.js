_failed_tests = _failed_asserts = _success_tests = _success_asserts = 0;
_result = '';

function test(name, cb) {
	var _errors = [];
	var _failed = 0;
	var _success = 0;
	
	function assert(condition, error) {
		if (!condition) {
			_errors.push(error);
			_failed++;
		} else {
			_success++;
		}
		return condition;
	}
	
	reset();
	cb(assert);
	
	_failed_asserts += _failed;
	_success_asserts += _success;
	_failed ? _failed_tests++ : _success_tests++;
	
	_result +='<div><h2 class="' + (_failed ? 'failed' : 'success') + '">Test: '
			+ name + '</h2><span>Total asserts: <strong>' + (_failed + _success)
			+ '</strong></span><span>Successful asserts: <strong>' + _success
			+ '</strong></span><span>Failed asserts: <strong>' + _failed
			+ '</strong></span><span>Passed: <strong>'
			+ Math.round((_success / (_failed + _success)) * 100) + '%</strong></span>';
	
	if (_failed) {
		_result += '<ul>';
		for (var i in _errors) _result += '<li>' + _errors[i] + '</li>';
		_result += '</ul>';
	}
	
	_result += '</div>';
}

window.onload = function() {
	document.getElementsByTagName('body')[0].innerHTML =
		'<div><h2 class="' + (_failed_tests ? 'failed' : 'success') + ' results">Results overview</h2>'
	  + '<span>Total tests: <strong>' + (_failed_tests + _success_tests) + '</strong></span>'
	  + '<span>Successful tests: <strong>' + _success_tests + '</strong></span>'
	  + '<span>Failed tests: <strong>' + _failed_tests + '</strong></span>'
	  + '<span>Passed: <strong>' + Math.round((_success_tests / (_failed_tests + _success_tests)) * 100) + '%</strong></span>'
	  + '<span>Total asserts: <strong>' + (_failed_asserts + _success_asserts) + '</strong></span>'
	  + '<span>Successful asserts: <strong>' + _success_asserts + '</strong></span>'
	  + '<span>Failed asserts: <strong>' + _failed_asserts + '</strong></span>'
	  + '<span>Passed: <strong>' + Math.round((_success_asserts / (_failed_asserts + _success_asserts)) * 100) + '%</strong></span>'
	  + '</div>' + _result;
}