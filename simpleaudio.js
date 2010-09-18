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
	 * Arguments validator.
	 * bool _args(array args, array expected)
	 * names = [name, name, name, ...]
	 * types = [type, [type optional], type, ...]
	 */
	function _(args, names, types) {
		var a = 0, out = {};
		for (var t in types) {
			var opt = types[t] instanceof Array,
				type = opt ? types[t][0] : types[t];
			if (!_type(args[a], type)) { // wrong type
				if (!opt) throw new Error('Wrong argument type (got ' + arr[a] + ', expected ' + type + ').'); // required, error
				else out[names[t]] = undefined; // optional, skip to next format
			} else out[names[t]] = args[a++]; // right type, move to next argument
		}
		return out;
	}
	
	function _type(value, type) {
		if (type instanceof RegExp) return type.match(value);
		else if (type === 'array') return value instanceof Array;
		else return typeof value === type;
	}
	
	/**
	 * Internal events handler.
	 */
	function _ev(event, name) {
		switch(event) {
		case 'error':
			delete _sounds[name];
			break;
		case 'loadstart':
			if (!_supported) break;
			// only happens once so we free some memory
			_sounds[name].removeEventListener('loadstart', _sounds[name]._lst, false);
			delete _sounds[name]._lst;
			break;
		case 'progress':
			clearTimeout(_sounds[name]._time_stalled);
			_sounds[name]._time_stalled = setTimeout(function() {_ev('loaded', name)}, 3500);
			break;
		case 'stalled':
			clearTimeout(_sounds[name]._time_stalled);
			return;
		case 'canplaythrough':
			// happens every time we reset currentTime on FF, so we don't emit
			// more than once.
			_sounds[name].removeEventListener('canplaythrough', _sounds[name]._cpt, false);
			delete _sounds[name]._cpt;
			break;
		case 'loaded':
			delete _sounds[name]._time_stalled;
			break;
		case 'pause':
			event = 'ended'; // always emit ended when sound stops
			break;
		case 'ended':
			_sounds[name].currentTime = 0; // must be set before pause on FF
			_sounds[name].pause();
			return; // don't emit here, see pause
		}
		if (_sounds[name].eventHandler) _sounds[name].eventHandler(event, name);
	}
	
	/**
	 * bool add(string name)
	 * bool add(string name, function eventHandler)
	 * Load a sound file.
	 */
	function add() {
		with (_(arguments,
					['name', 'eventHandler'],
					['string', ['function']])) {
			if (_sounds[name]) return false;
			if (!_supported) {
				_sounds[name] = {_source: ''}
				if (eventHandler) {
					eventHandler('loadstart', name);
					eventHandler('loaded', name);
				}
				return true;
			}
			
			var url = _path + name + _supported;
			_sounds[name] = new Audio(url);
			_sounds[name]._source = url;
			_sounds[name].volume = _volume;
			
			if (eventHandler) {
				_sounds[name].eventHandler = eventHandler;
				
				// attach events
				_sounds[name].addEventListener('error', function() {_ev('error', name);}, false);
				_sounds[name]._lst = function() {_ev('loadstart', name);};
				_sounds[name].addEventListener('loadstart', _sounds[name]._lst, false);
				_sounds[name].addEventListener('progress', function() {_ev('progress', name);}, false);
				_sounds[name].addEventListener('stalled', function() {_ev('stalled', name);}, false);
				_sounds[name]._cpt = function() {_ev('canplaythrough', name)}
				_sounds[name].addEventListener('canplaythrough', _sounds[name]._cpt, false);
				_sounds[name].addEventListener('play', function() {_ev('play', name);}, false);
				_sounds[name].addEventListener('pause', function() {_ev('pause', name);}, false);
				_sounds[name].addEventListener('ended', function() {_ev('ended', name);}, false);
			}
			
			_sounds[name].load();
			return true;
		}
	}
	htmlaudio.add = add;
	
	/**
	 * string path()
	 * void path(string path)
	 * Get or set the path to the folder containing the sound files.
	 */
	function path() {
		with (_(arguments, ['path'], [['string']])) {
			if (path == undefined) return _path;
			if (path !== '' && !path.match(/\/$/)) path += '/';
			_path = path;
			return null;
		}
	}
	htmlaudio.path = path;
	
	/**
	 * bool play(string name)
	 * Play the sound identified by name.
	 */
	function play() {
		with (_(arguments, ['name'], ['string'])) {
			if (!_sounds[name]) return false;
			if (!_supported) return true;
			if (_sounds[name].ended) _sounds[name].pause(); // Hack to force browsers to emit the 'play' event on subsequent plays.
			_sounds[name].play();
			return true;
		}
	}
	htmlaudio.play = play;
	
	/**
	 * void remove()
	 * void remove(string name)
	 * Remove all sounds or just the sound identified by name from the library.
	 */
	function remove() {
		with (_(arguments, ['name'], [['string']])) {
			if (name === undefined) {
				this.stop();
				_sounds = {};
				return true;
			}
			if (_sounds[name]) {
				this.stop(name);
				delete _sounds[name];
			}
			return true;
		}
	}
	htmlaudio.remove = remove;
	
	/**
	 * string source(string name)
	 * Return the full url of the audio object.
	 */
	function source() {
		with (_(arguments, ['name'], ['string'])) {
			if (!_sounds[name]) return '';
			return _sounds[name]._source;
		}
	}
	htmlaudio.source = source;
	
	/**
	 * void stop()
	 * void stop(string name)
	 * Stop all playing sounds or just the sound given by name.
	 */
	function stop() {
		with (_(arguments, ['name'], [['string']])) {
			if (name === undefined) {
				for (var s in _sounds) this.stop(s);
				return null;
			}
			if (!_supported || !_sounds[name]) return null;
			if (_sounds[name].currentTime) _sounds[name].currentTime = 0;
			_sounds[name].pause
			return null;
		}
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
	function volume() {
		with (_(arguments, ['volume'], [['number']])) {
			if (!volume) return _volume;
			if (volume < 0 || volume > 1) volume = 1.0;
			_volume = volume;
			for (var s in _sounds) _sounds[s].volume = volume;
			return null;
		}
	}
	htmlaudio.volume = volume;
	
	window.htmlaudio = htmlaudio;
}());