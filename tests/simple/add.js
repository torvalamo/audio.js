test('.add() correct input', function(assert) {
	htmlaudio.path('../sounds');
	assert(htmlaudio.add('heal') === true, 'Add did not return true when successfully adding a sound.');
	assert(htmlaudio.add('heal') === false, 'Add did not return false when adding a sound that already existed.');
	assert(htmlaudio.source('heal') !== '', 'Audio source URL was not what was expected.');
	assert(htmlaudio.source('heal').match(/\/sounds\/heal\.(mp3|ogg)$/), 'Audio source URL was not what was expected.');
});

test('.add() erroneous input', function(assert) {
	try {assert(htmlaudio.add() === null, 'Add complained when not supplying arguments. Should throw exception.');}
	catch(e) {assert(e instanceof Error, 'Add did not throw a proper exception.');}
	try {htmlaudio.add(null);assert(false, 'Add complained when adding invalid type name (null). Should throw exception.');}
	catch(e) {assert(e instanceof Error, 'Add did not throw a proper exception.');}
	try {htmlaudio.add(123);assert(false, 'Add complained when adding invalid type name (number). Should throw exception.');}
	catch(e) {assert(e instanceof Error, 'Add did not throw a proper exception.');}
	try {htmlaudio.add(false);assert(false, 'Add complained when adding invalid type name (boolean). Should throw exception.');}
	catch(e) {assert(e instanceof Error, 'Add did not throw a proper exception.');}
	try {htmlaudio.add([]);assert(false, 'Add complained when adding invalid type name (array). Should throw exception.');}
	catch(e) {assert(e instanceof Error, 'Add did not throw a proper exception.');}
});