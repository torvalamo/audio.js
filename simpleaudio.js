/**
 * This file is licensed under the WTFPL.
 * http://sam.zoy.org/wtfpl/COPYING
 *
 * For an overview of these functions and what they do, see
 * http://github.com/torvalamo/htmlaudio/wiki
 */

(function() {
	var htmlaudio = {};
	var _path = '';
	var _sounds = {};
	var _supported = false;
	var _volume = 1.0;
	
	// Check for support.
	try {
		var audioObj = new Audio('');
		if (audioObj.canPlayType('audio/ogg')) _supported = '.ogg';
		else if (audioObj.canPlayType('audio/mpeg')) _supported = '.mp3';
		delete audioObj;
	} catch(e) {}
	
	/**
	 * void add(string name)
	 * void add(string name, function eventHandler)
	 * Load a sound file.
	 */
	function add(name, eventHandler) {
		if (!name || typeof name !== 'string') return null;
		if (!_supported) {
			if (!eventHandler || typeof eventHandler !== 'function') {
				eventHandler = function() {};
			}
			_sounds[name] = {eventHandler: eventHandler};
			eventHandler('loadstart', name);
			eventHandler('progress', name);
			eventHandler('canplaythrough', name);
			return null;
		}
		
		_sounds[name] = new Audio(_path + name + _supported);
		_sounds[name].volume = _volume;
		
		if (!eventHandler || typeof eventHandler !== 'function') return null;
		
		// Attach events
		_sounds[name].addEventListener('error', function() {eventHandler('error', name);}, false);
		_sounds[name].addEventListener('loadstart', function () {eventHandler('loadstart', name);}, false);
		_sounds[name].addEventListener('progress', function () {eventHandler('progress', name);}, false);
		function cpt() {
			// Happens each time we change currentTime, so we'll remove the listener after the first time.
			eventHandler('canplaythrough', name);
			_sounds[name].removeEventListener('canplaythrough', cpt, false);
		}
		_sounds[name].addEventListener('canplaythrough', cpt, false);
		_sounds[name].addEventListener('play', function () {eventHandler('play', name);}, false);
		_sounds[name].addEventListener('pause', function () {eventHandler('ended', name);}, false);
		function end() {
			// We need to pause it to make it send the play event after end, so to avoid two
			// different events, we skip the ended and make it pause instead (which is routed
			// to ended anyways in the line above this function).
			_sounds[name].pause();
			_sounds[name].currentTime = 0;
		}
		_sounds[name].addEventListener('ended', end, false);
		
		return null;
	}
	htmlaudio.add = add;
	
	/**
	 * string path()
	 * void path(string path)
	 * Get or set the path to the folder containing the sound files.
	 */
	function path(path) {
		if (!path || typeof path !== 'string') return _path;
		if (!path.match(/\/$/)) path += '/';
		_path = path;
		return null;
	}
	htmlaudio.path = path;
	
	/**
	 * void play(string name)
	 * Play the sound identified by name.
	 */
	function play(name) {
		if (!name || typeof name !== 'string') return null;
		if (!_sounds[name]) return null;
		if (!_supported) {
			_sounds[name].eventHandler('play', name);
			_sounds[name].eventHandler('ended', name);
			return null;
		}
		// Hack to force browsers to emit the 'play' event after first play.
		if (_sounds[name].ended) _sounds[name].pause();
		_sounds[name].play();
		return null;
	}
	htmlaudio.play = play;
	
	/**
	 * void remove()
	 * void remove(string name)
	 * Remove all sounds or just the sound identified by name from the library.
	 */
	function remove(name) {
		if (!name || typeof name !== 'string') {
			this.stop();
			_sounds = {};
			return null;
		}
		this.stop(name);
		delete _sounds[name];
		return null;
	}
	htmlaudio.remove = remove;
	
	/**
	 * void stop()
	 * void stop(string name)
	 * Stop all playing sounds or just the sound given by name.
	 */
	function stop(name) {
		if (!name || typeof name !== 'string') {
			for (var s in _sounds) this.stop(s);
			return null;
		}
		if (!_supported || !_sounds[name] || _sounds[name].ended) return null;
		_sounds[name].pause();
		_sounds[name].currentTime = 0;
		return null;
	}
	htmlaudio.stop = stop;
	
	/**
	 * bool supported()
	 * Tell whether or not the browser can play ogg or mp3 files.
	 */
	function supported() {
		return (_supported !== false);
	}
	htmlaudio.supported = supported;
	
	/**
	 * float volume()
	 * void volume(float volume)
	 * Get or set the volume for all the sounds.
	 */
	function volume(volume) {
		if (!volume || isNaN(volume)) return _volume;
		if (volume < 0 || volume > 1) volume = 1.0;
		_volume = volume;
		for (var s in _sounds) _sounds[s].volume = volume;
		return null;
	}
	htmlaudio.volume = volume;
	
	window.htmlaudio = htmlaudio;
}());