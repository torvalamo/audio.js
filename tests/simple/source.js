test('.source() correct input', function(assert) {
	htmlaudio.add('url');
	assert(htmlaudio.source('url').match(/url.(mp3|ogg)/), 'Source returned unexpected url.');
	htmlaudio.path('sounds');
	assert(htmlaudio.source('url').match(/url.(mp3|ogg)/), 'Source returned unexpected url when path changed. Should remain the same.');
	htmlaudio.add('thing');
	assert(htmlaudio.source('thing').match(/sounds\/thing.(mp3|ogg)/), 'Source returned unexpected url when path set.');
});

test('.source() erroneous input', function(assert) {
	assert(htmlaudio.source('url') === '', 'Source should return blank string on unknown sound name.');
	try {htmlaudio.source();assert(false, 'Source did not throw an exception when setting invalid type source (undefined).');}
	catch(e) {assert(e instanceof Error, 'Source did not throw a proper exception.');}
	try {htmlaudio.source(null);assert(false, 'Source did not throw an exception when setting invalid type source (null).');}
	catch(e) {assert(e instanceof Error, 'Source did not throw a proper exception.');}
	try {htmlaudio.source(123);assert(false, 'Source did not throw an exception when setting invalid type source (number).');}
	catch(e) {assert(e instanceof Error, 'Source did not throw a proper exception.');}
	try {htmlaudio.source(false);assert(false, 'Source did not throw an exception when setting invalid type source (boolean).');}
	catch(e) {assert(e instanceof Error, 'Source did not throw a proper exception.');}
	try {htmlaudio.source([]);assert(false, 'Source did not throw an exception when setting invalid type source (array).');}
	catch(e) {assert(e instanceof Error, 'Source did not throw a proper exception.');}
});