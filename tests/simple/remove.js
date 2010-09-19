test('.remove() correct input', function(assert) {
	htmlaudio.add('heal');
	assert(htmlaudio.remove('heal') === null, 'Remove did not return null.');
	assert(htmlaudio.add('heal') === true, 'Remove did not remove the sound.');
	htmlaudio.add('more');
	assert(htmlaudio.remove() === null, 'Remove all did not return null.');
	assert(htmlaudio.add('heal') === true, 'Remove all did not remove all.');
});

test('.remove() erroneous input', function(assert) {
	assert(htmlaudio.remove('unknown') === null, 'Removing unknown did not return null.');
	try {htmlaudio.remove(null);assert(false, 'Remove did not throw an exception when setting invalid type remove (null).');}
	catch(e) {assert(e instanceof Error, 'Remove did not throw a proper exception.');}
	try {htmlaudio.remove(123);assert(false, 'Remove did not throw an exception when setting invalid type remove (number).');}
	catch(e) {assert(e instanceof Error, 'Remove did not throw a proper exception.');}
	try {htmlaudio.remove(false);assert(false, 'Remove did not throw an exception when setting invalid type remove (boolean).');}
	catch(e) {assert(e instanceof Error, 'Remove did not throw a proper exception.');}
	try {htmlaudio.remove([]);assert(false, 'Remove did not throw an exception when setting invalid type remove (array).');}
	catch(e) {assert(e instanceof Error, 'Remove did not throw a proper exception.');}
});