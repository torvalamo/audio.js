test('.play() correct input', function(assert) {
	htmlaudio.path('../sounds');
	htmlaudio.add('heal');
	assert(htmlaudio.play('heal') === true, 'Play did not return true on success.');
});

test('.play() erroneous input', function(assert) {
	assert(htmlaudio.play('unknown') === false, 'Play did not return false when supplied unknown sound.');
	try {htmlaudio.play();assert(false, 'Play did not throw an exception on empty arguments list.');}
	catch(e) {assert(e instanceof Error, 'Play did not throw a proper exception.');}
	try {htmlaudio.play(null);assert(false, 'Play did not throw an exception when playing invalid type name (null).');}
	catch(e) {assert(e instanceof Error, 'Play did not throw a proper exception.');}
	try {htmlaudio.play(123);assert(false, 'Play did not throw an exception when playing invalid type name (number).');}
	catch(e) {assert(e instanceof Error, 'Play did not throw a proper exception.');}
	try {htmlaudio.play(false);assert(false, 'Play did not throw an exception when playing invalid type name (boolean).');}
	catch(e) {assert(e instanceof Error, 'Play did not throw a proper exception.');}
	try {htmlaudio.play([]);assert(false, 'Play did not throw an exception when playing invalid type name (array).');}
	catch(e) {assert(e instanceof Error, 'Play did not throw a proper exception.');}
});