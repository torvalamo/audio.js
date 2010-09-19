test('.supported() correct input', function(assert) {
	assert(typeof htmlaudio.supported() === 'boolean', 'supported() should return boolean.');
});

test('.supported() erroneous input', function(assert) {
	assert(typeof htmlaudio.supported('something') === 'boolean', 'supported() should return boolean always.');
});