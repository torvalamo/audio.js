/**
 * This file is licensed under the WTFPL.
 * http://sam.zoy.org/wtfpl/COPYING
 *
 * For an overview of these functions and what they do, see
 * http://github.com/torvalamo/htmlaudio/wiki/Simple-Reference
 */

(function() {
	window.htmlaudio = {}
	var _sounds = {}
	var _path = ''
	var _extension = false
	var _volume = 1
	
	try {
		var audioObj = new Audio('');
		if (audioObj.canPlayType('audio/ogg')) _extension = '.ogg';
		else if (audioObj.canPlayType('audio/mpeg')) _extension = '.mp3';
		delete audioObj;
	} catch(e) {}
	
	function _type(value, type) {
		if (type instanceof RegExp) return type.match(value)
		else if (type === 'regexp') return value instanceof RegExp
		else if (type === 'array') return value instanceof Array
		else return typeof value === type
	}
	
	function _(args, names, types) {
		var a = 0, out = {}
		for (var t in types) {
			var opt = types[t] instanceof Array,
				type = opt ? types[t][0] : types[t]
			if (!_type(args[a], type)) { // wrong type
				if (!opt || (args[a] !== undefined && t == types.length - 1)) {
					// required or end optional, error
					throw new Error('Wrong argument type (argument #' + a +
									' got ' + args[a] + ', expected ' + type +
									').')
				} else {
					// optional, skip to next format
					out[names[t]] = undefined
				}
			} else {
				// right type, move to next argument
				out[names[t]] = args[a++]
			}
		}
		return out
	}
	
	function Sound(name) {
		this.play = function() {
			if (!_extension) return
			if (this.audio.ended) {
				// Necessary to make browsers emit the 'play' event if the
				// sound has already played once.
				this.audio.pause()
			}
			this.audio.play()
		}
		
		this.stop = function() {
			if (!_extension) return
			if (this.audio.currentTime) this.audio.currentTime = 0
			this.audio.pause()
		}
		
		this.volume = function(volume) {
			if (!_extension) return
			this.audio.volume = volume
		}
		
		this.listeners = {}
		
		this.addListener = function(type, eventListener) {
			if (!this.listeners[type]) this.listeners[type] = []
			this.listeners[type].push(eventListener)
		}
		
		this.dispatch = function(type) {
			if (!this.listeners[type]) return
			for (var f in this.listeners[type]) {
				this.listeners[type][f](type)
			}
		}
		
		var that = this
		this.url = ''
		this.source = function() {
			return this.url;
		}
		
		if (!_extension) {
			setTimeout(function() {
				that.dispatch('loadstart')
				that.dispatch('loaded')
			}, 10)
			return
		}
		
		this.url = _path + name + _extension
		this.audio = new Audio(this.url)
		this.audio.volume = _volume
		this.source = function(full) {
			return full ? this.audio.currentSrc : this.url;
		}
		
		this.loaded = function() {
			that.dispatch('loaded')
			that.audio.removeEventListener('progress', that.eventDispatcher, false)
			that.audio.removeEventListener('stalled', that.eventDispatcher, false)
			delete that.progress
			delete that.loaded
		}
		
		this.eventDispatcher = function(event) {
			var type = event.type
			switch(type) {
			case 'loadstart':
				that.audio.removeEventListener('loadstart', that.eventDispatcher, false)
				break
			case 'progress':
				clearTimeout(that.progress)
				that.progress = setTimeout(that.loaded, 3500)
				break
			case 'stalled':
				clearTimeout(that.progress)
				return
			case 'canplaythrough':
				that.audio.removeEventListener('canplaythrough', that.eventDispatcher, false)
				break
			case 'pause':
				type = 'ended'
				break
			case 'ended':
				that.audio.currentTime = 0 // must be set before pause on FF
				that.audio.pause()
				return // don't emit here, see pause
			}
			that.dispatch(type)
		}
		
		this.audio.addEventListener('error', this.eventDispatcher, false)
		this.audio.addEventListener('loadstart', this.eventDispatcher, false)
		this.audio.addEventListener('progress', this.eventDispatcher, false)
		this.audio.addEventListener('stalled', this.eventDispatcher, false)
		this.audio.addEventListener('canplaythrough', this.eventDispatcher, false)
		this.audio.addEventListener('play', this.eventDispatcher, false)
		this.audio.addEventListener('pause', this.eventDispatcher, false)
		this.audio.addEventListener('ended', this.eventDispatcher, false)
		
		this.audio.load()
	}
	
	/**
	 * boolean add(string name)
	 * boolean add(string name, function eventHandler)
	 */
	window.htmlaudio.add = function() {
		with (_(arguments,
				['name', 'eventHandler'],
				['string', ['function']])) {
			if (_sounds[name]) return false
			
			var sound = new Sound(name)
			
			var eventListener = function(event) {
				eventHandler && eventHandler(event, name)
			}
			
			sound.addListener('error', eventListener)
			sound.addListener('loadstart', eventListener)
			sound.addListener('progress', eventListener)
			sound.addListener('canplaythrough', eventListener)
			sound.addListener('loaded', eventListener)
			sound.addListener('play', eventListener)
			sound.addListener('ended', eventListener)
			
			_sounds[name] = sound
			return true
		}
	}
	
	/**
	 * array list()
	 * array list(string search)
	 * array list(regexp filter)
	 * array list(string search, regexp filter)
	 */
	window.htmlaudio.list = function() {
		with (_(arguments,
				['search', 'filter'],
				[['string'], ['regexp']])) {
			var result = []
			for (var s in _sounds) {
				if (search && s.indexOf(search) == -1) continue
				else if (filter && !s.match(filter)) continue
				result.push(s)
			}
			return result
		}
	}
	
	/**
	 * string path()
	 * void path(string path)
	 */
	window.htmlaudio.path = function() {
		with (_(arguments,
				['path'],
				[['string']])) {
			if (path == undefined) return _path
			if (path != '' && !path.match(/\/$/)) path += '/'
			_path = path
			return null
		}
	}
	
	/**
	 * boolean play(string sound)
	 */
	window.htmlaudio.play = function() {
		with (_(arguments,
				['sound'],
				['string'])) {
			if (!_sounds[sound]) return false
			_sounds[sound].play()
			return true
		}
	}
	
	/**
	 * void remove()
	 * void remove(string sound)
	 */
	window.htmlaudio.remove = function() {
		with (_(arguments,
				['sound'],
				[['string']])) {
			if (sound == undefined) {
				this.stop()
				_sounds = {}
			} else if (_sounds[sound]) {
				this.stop(sound)
				delete _sounds[sound]
			}
			return null
		}
	}
	
	/**
	 * string source(string sound)
	 * string source(string sound, boolean full)
	 */
	window.htmlaudio.source = function() {
		with (_(arguments,
				['sound', 'full'],
				['string', ['boolean']])) {
			if (!_sounds[sound]) return ''
			return _sounds[sound].source(full != undefined)
		}
	}
	
	/**
	 * void stop()
	 * void stop(string sound)
	 */
	window.htmlaudio.stop = function() {
		with (_(arguments,
				['sound'],
				[['string']])) {
			if (sound == undefined) {
				for (var s in _sounds) _sounds[s].stop()
			} else if (_sounds[sound]) {
				_sounds[sound].stop()
			}
			return null
		}
	}
	
	/**
	 * boolean supported()
	 */
	window.htmlaudio.supported = function() {
		return (_extension !== false)
	}
	
	/**
	 * double volume()
	 * void volume(double volume)
	 */
	window.htmlaudio.volume = function() {
		with (_(arguments,
				['volume'],
				[['number']])) {
			if (volume == undefined) return _volume
			if (volume < 0 || volume > 1) volume = 1
			_volume = volume
			for (var s in _sounds) _sounds[s].volume(volume)
			return null
		}
	}
})()