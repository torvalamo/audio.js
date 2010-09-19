test('.path() correct input', function(assert) {
	assert(htmlaudio.path() === '', 'Initial get did not return empty string.');
	assert(htmlaudio.path('/sounds/') === null, 'Setting path did not return null.');
	assert(htmlaudio.path() === '/sounds/', 'Get path did not match the one set.');
	htmlaudio.path('/sounds');
	assert(htmlaudio.path() === '/sounds/', 'Setting absolute path without ending slash did not append it.');
	htmlaudio.path('sounds');
	assert(htmlaudio.path() === 'sounds/', 'Setting relative path without ending slash did not append it.');
	htmlaudio.path('');
	assert(htmlaudio.path() === '', 'Setting path to empty string appends a slash, making any path absolute.')
});

test('.path() erroneous input', function(assert) {
	assert(htmlaudio.path('\n') === null, 'Path complained when setting invalid string path ("\n"). Should not check.');
	assert(htmlaudio.path() === '\n/', 'Path did not return last set string path ("\n").');
	try {htmlaudio.path(null);assert(false, 'Path did not throw an exception when setting invalid type path (null).');}
	catch(e) {assert(e instanceof Error, 'Path did not throw a proper exception.');}
	try {htmlaudio.path(123);assert(false, 'Path did not throw an exception when setting invalid type path (number).');}
	catch(e) {assert(e instanceof Error, 'Path did not throw a proper exception.');}
	try {htmlaudio.path(false);assert(false, 'Path did not throw an exception when setting invalid type path (boolean).');}
	catch(e) {assert(e instanceof Error, 'Path did not throw a proper exception.');}
	try {htmlaudio.path([]);assert(false, 'Path did not throw an exception when setting invalid type path (array).');}
	catch(e) {assert(e instanceof Error, 'Path did not throw a proper exception.');}
	assert(htmlaudio.path() === '\n/', 'Path did not ignore invalid type paths to return the last valid type setting.');
});