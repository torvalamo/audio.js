test('.stop() correct input', function(assert) {
	htmlaudio.add('url');
	assert(htmlaudio.stop('url') === null, 'Stop did not return null.');
	htmlaudio.play('url');
	assert(htmlaudio.stop('url') === null, 'Stop did not return null.');
	htmlaudio.play('url');
	assert(htmlaudio.stop() === null, 'Stop all did not return null.');
});

test('.stop() erroneous input', function(assert) {
	assert(htmlaudio.stop() === null, 'Stop all did not return null.');
	assert(htmlaudio.stop('unknown') === null, 'Stop did not return null on unknown input.');
	try {htmlaudio.stop(null);assert(false, 'Stop did not throw an exception on invalid type sound name (null).');}
	catch(e) {assert(e instanceof Error, 'Stop did not throw a proper exception.')}
	try {htmlaudio.stop(123);assert(false, 'Stop did not throw an exception on invalid type sound name (number).');}
	catch(e) {assert(e instanceof Error, 'Stop did not throw a proper exception.')}
	try {htmlaudio.stop(false);assert(false, 'Stop did not throw an exception on invalid type sound name (bool).');}
	catch(e) {assert(e instanceof Error, 'Stop did not throw a proper exception.')}
	try {htmlaudio.stop([]);assert(false, 'Stop did not throw an exception on invalid type sound name (array).');}
	catch(e) {assert(e instanceof Error, 'Stop did not throw a proper exception.')}
});