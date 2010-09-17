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
	 * Internal events handler.
	 */
	function _ev(event, name) {
		switch(event) {
		case 'progress':
			clearTimeout(_sounds[name].time_stalled);
			_sounds[name].time_stalled = setTimeout(function() {_ev('loaded', name)}, 3500);
			break;
		case 'stalled':
			clearTimeout(_sounds[name].time_stalled);
			return;
		case 'canplaythrough':
			// happens every time we reset currentTime, so we don't emit
			// more than once.
			if (_sounds[name]._cpt) return;
			_sounds[name]._cpt = true;
			break;
		case 'loaded':
			delete _sounds[name].time_stalled;
			break;
		case 'pause':
			event = 'ended'; // always emit ended when sound stops
			break;
		case 'ended':
			_sounds[name].pause();
			_sounds[name].currentTime = 0;
			return; // don't emit here, see pause
		}
		if (_sounds[name].eventHandler) _sounds[name].eventHandler(event, name);
	}
	
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
			eventHandler('loaded', name);
			return null;
		}
		
		_sounds[name] = new Audio(_path + name + _supported);
		_sounds[name]._cpt = false;
		_sounds[name].volume = _volume;
		
		if (!eventHandler || typeof eventHandler !== 'function') return null;
		_sounds[name].eventHandler = eventHandler;
		
		// attach events
		_sounds[name].addEventListener('error', function() {_ev('error', name);}, false);
		_sounds[name].addEventListener('loadstart', function() {_ev('loadstart', name);}, false);
		_sounds[name].addEventListener('progress', function() {_ev('progress', name);}, false);
		_sounds[name].addEventListener('stalled', function() {_ev('stalled', name);}, false);
		_sounds[name].addEventListener('canplaythrough', function() {_ev('canplaythrough', name);}, false);
		_sounds[name].addEventListener('play', function() {_ev('play', name);}, false);
		_sounds[name].addEventListener('pause', function() {_ev('pause', name);}, false);
		_sounds[name].addEventListener('ended', function() {_ev('ended', name);}, false);
		
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