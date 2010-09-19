test('.volume() correct input', function(assert) {
	assert(htmlaudio.volume() === 1, 'Default volume was not 1.');
	assert(htmlaudio.volume(0.5) === null, 'Setting the volume did not return null.');
	assert(htmlaudio.volume() === 0.5, 'Setting the volume did not store the value.');
});

test('.volume() erroneous input', function(assert) {
	assert(htmlaudio.volume(2) === null, 'Volume complained when setting out of bounds volume values. Should return null.');
	try {htmlaudio.volume(null);assert(false, 'Volume did not throw an exception when setting invalid type volume (null).');}
	catch(e) {assert(e instanceof Error, 'Volume did not throw a proper exception.');}
	try {htmlaudio.volume('string');assert(false, 'Volume did not throw an exception when setting invalid type volume (string).');}
	catch(e) {assert(e instanceof Error, 'Volume did not throw a proper exception.');}
	try {htmlaudio.volume(false);assert(false, 'Volume did not throw an exception when setting invalid type volume (boolean).');}
	catch(e) {assert(e instanceof Error, 'Volume did not throw a proper exception.');}
	try {htmlaudio.volume([]);assert(false, 'Volume did not throw an exception when setting invalid type volume (array).');}
	catch(e) {assert(e instanceof Error, 'Volume did not throw a proper exception.');}
});