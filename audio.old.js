/**
 * This file is licensed under the WTFPL.
 * http://sam.zoy.org/wtfpl/COPYING
 *
 * For an overview of these functions and what they do, see
 * http://github.com/torvalamo/htmlaudio/wiki
 */

(function() {
	window.htmlaudio = {
		FADE_CURVE_LINEAR: 0,
		FADE_CURVE_LOGARITHMIC: 1,
		FADE_CURVE_EXPONENTIAL: 2
	}
	var _channels = {}
	var _extension = false
	var _fadeCurve = window.htmlaudio.FADE_CURVE_LINEAR
	var _fadeResolution = 10
	var _fadeTime = 0
	var _groups = {}
	var _path = ''
	var _sounds = {}
	var _type = ''
	var _volume = 1
	
	function __(value, type) {
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
			if (!__(args[a], type)) { // wrong type
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
	
	function Channel(name) {
		this._volume = 1
		this.groups = []
		this.fadeTime = function(fadeTime) {
			if (fadeTime == undefined) {
				if (this._fadeTime) return this._fadeTime
				return _fadeTime
			}
			this._fadeTime = fadeTime
			if (fadeTime < 0) delete this._fadeTime
			return null
		}
		this.volume = function(volume) {
			if (volume == undefined) return this._volume
			this._volume = volume
			volume *= _volume
			for (var g in this.groups) {
				_groups[this.groups[g]].volume(volume)
			}
			return null
		}
	}
	
	function Group(name, channel) {
		this.limit = 1
		this.playing = 0
		this.nonpriority = []
		this.channel = _channels[channel]
		this.sounds = []
		this.volume = function(volume) {
			for (var s in this.sounds) _sounds[this.sounds[s]].volume(volume)
		}
	}
	
	function Sound(name, group, priority, limit) {
		this.priority = false
		this.peak = 1
		this.fading = false
		this.group = _groups[group]
		
		this.play = function(loop, reset, fadeTime) {
			if (!_extension) return
			this.audio.loop = loop
			if (reset && !this.audio.paused) {
				this.audio.currentTime = 0
				return
			}
			if (this.group.playing >= this.group.limit) {
				if (!this.priority) return
				if (this.group.nonpriority.length == 0) return
				_sounds[this.group.nonpriority.pop()].stop()
			}
			if (!this.priority) {
				this.group.nonpriority.push(name)
			}
			this.audio.play()
		}
		
		this.pause = function(reset, fadeTime) {
			if (!_extension) return
			if (reset) this.audio.currentTime = 0
			this.audio.pause()
		}
		
		this.volume = function(volume) {
			if (!_extension) return
			this.peak = volume
			if (!this.fading) this.audio.volume = volume
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
			case 'play':
				that.group.playing++
				if (!that.priority) that.group.nonpriority.push(name)
				break
			case 'pause':
				that.group.playing--
				if (!that.priority) {
					var i = that.group.nonpriority.indexOf(name)
					that.group.nonpriority.slice(i, 1)
				}
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
	 * boolean add(string name, string group)
	 * boolean add(string name, string group, number limit)
	 * boolean add(string name, string group, boolean priority)
	 * boolean add(string name, string group, number limit, boolean priority)
	 * boolean add(string name, string group, function eventHandler)
	 * boolean add(string name, string group, number limit, function eventHandler)
	 * boolean add(string name, string group, boolean priority, function eventHandler)
	 * boolean add(string name, string group, number limit, boolean priority, function eventHandler)
	 */
	window.htmlaudio.add = function() {
		with (_(arguments,
				['name', 'group', 'limit', 'priority', 'eventHandler'],
				['string', 'string', ['number'], ['boolean'], ['function']])) {
			if (_sounds[name] || !_groups[group]) return false
			
			var sound = new Sound(name, group, !!priority, limit < 1 ? 1 : limit)
			
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
	 * boolean addChannel(string name)
	 */
	window.htmlaudio.addChannel = function() {
		with (_(arguments,
				['name'],
				['string'])) {
			if (_channels[name]) return false
			
			_channels[name] = new Channel(name)
			return true
		}
	}
	
	/**
	 * boolean addGroup(string name, string channel)
	 */
	window.htmlaudio.addGroup = function() {
		with (_(arguments,
				['name', 'channel'],
				['string', 'string'])) {
			if (_groups[name] || !_channels[channel]) return false
			
			_groups[name] = new Group(name, channel)
			_channels[channel].groups.push(name)
			return true
		}
	}
	
	/**
	 * number fadeCurve()
	 * void fadeCurve(number fadeCurve)
	 */
	window.htmlaudio.fadeCurve = function() {
		with (_(arguments,
				['fadeCurve'],
				[['number']])) {
			if (fadeCurve == undefined) return _fadeCurve
			fadeCurve = Math.round(fadeCurve)
			if (fadeCurve < 0 || fadeCurve > 2) fadeCurve = 0
			_fadeCurve = fadeCurve
			return null
		}
	}
	
	/**
	 * number fadeResolution()
	 * void fadeResolution(number fadeResolution)
	 */
	window.htmlaudio.fadeResolution = function() {
		with (_(arguments,
				['fadeResolution'],
				[['number']])) {
			if (fadeResolution == undefined) return _fadeResolution
			fadeResolution = Math.round(fadeResolution)
			if (fadeResolution < 1) fadeResolution = 1
			_fadeResolution = fadeResolution
			return null
		}
	}
	
	/**
	 * number fadeTime()
	 * number fadeTime(string channel)
	 * void fadeTime(number fadeTime)
	 * void fadeTime(string channel, number fadeTime)
	 */
	window.htmlaudio.fadeTime = function() {
		with (_(arguments,
				['channel', 'fadeTime'],
				[['string'], ['number']])) {
			if (channel == undefined) {
				if (fadeTime == undefined) return _fadeTime
				fadeTime = Math.round(fadeTime)
				if (fadeTime < 0) fadeTime = 0
				_fadeTime = fadeTime
				return null
			}
			if (!_channels[channel]) return null
			if (fadeTime == undefined) return _channels[channel].fadeTime()
			fadeTime = Math.round(fadeTime)
			_channels[channel].fadeTime(fadeTime)
			return null
		}
	}
	
	/**
	 * number limit(string group)
	 * void limit(string group, number limit)
	 */
	window.htmlaudio.limit = function() {
		with (_(arguments,
				['group', 'limit'],
				['string', ['number']])) {
			if (!_groups[group]) return null
			if (limit == undefined) return _groups[group].limit
			if (limit < 1) limit = 1
			_groups[group].limit = limit
			return null
		}
	}
	
	/**
	 * array list()
	 * array list(string search)
	 * array list(regexp filter)
	 * array list(string search, regexp filter)
	 */
	window.htmlaudio.list = function() {}
	
	/**
	 * array listChannels()
	 * array listChannels(string search)
	 * array listChannels(regexp filter)
	 * array listChannels(string search, regexp filter)
	 */
	window.htmlaudio.listChannels = function() {}
	
	/**
	 * array listChannelGroups(string channel)
	 * array listChannelGroups(string channel, string search)
	 * array listChannelGroups(string channel, regexp filter)
	 * array listChannelGroups(string channel, string search, regexp filter)
	 */
	window.htmlaudio.listChannelGroups = function() {}
	
	/**
	 * array listChannelSounds(string channel)
	 * array listChannelSounds(string channel, string search)
	 * array listChannelSounds(string channel, regexp filter)
	 * array listChannelSounds(string channel, string search, regexp filter)
	 */
	window.htmlaudio.listChannelSounds = function() {}
	
	/**
	 * array listGroups()
	 * array listGroups(string search)
	 * array listGroups(regexp filter)
	 * array listGroups(string search, regexp filter)
	 */
	window.htmlaudio.listGroups = function() {}
	
	/**
	 * array listGroupSounds(string group)
	 * array listGroupSounds(string group, string search)
	 * array listGroupSounds(string group, regexp filter)
	 * array listGroupSounds(string group, string search, regexp filter)
	 */
	window.htmlaudio.listGroupSounds = function() {}
	
	/**
	 * void loop(string sound)
	 * void loop(string sound, boolean reset)
	 * void loop(string sound, number fadeTime)
	 * void loop(string sound, boolean reset, number fadeTime)
	 */
	window.htmlaudio.loop = function() {
		with (_(arguments,
				['sound', 'reset', 'fadeTime'],
				['string', ['boolean'], ['number']])) {
			if (!_sounds[sound]) return
			_sounds[sound].play(true, reset, fadeTime)
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
			if (!path.match(/\/$/)) path += '/'
			_path = path
			return null
		}
	}
	
	/**
	 * void pause()
	 * void pause(string sound)
	 * void pause(number fadeTime)
	 * void pause(string sound, number fadeTime)
	 */
	window.htmlaudio.pause = function() {
		with (_(arguments,
				['sound', 'fadeTime'],
				[['string'], ['number']])) {
			if (sound == undefined) {
				for (var s in _sounds) _sounds[s].pause(false, fadeTime)
				return
			}
			if (!_sounds[sound]) return
			_sounds[sound].pause(false, fadeTime)
		}
	}
	
	/**
	 * boolean play(string sound)
	 * boolean play(string sound, boolean reset)
	 * boolean play(string sound, number fadeTime)
	 * boolean play(string sound, boolean reset, number fadeTime)
	 */
	window.htmlaudio.play = function() {
		with (_(arguments,
				['sound', 'reset', 'fadeTime'],
				['string', ['reset'], ['fadeTime']])) {
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
				for (var g in _groups) _groups[g].sounds = []
				for (var s in _sounds) _sounds[s].pause(false, 0)
				_sounds = {}
				return
			}
			if (!_sounds[sound]) return
			var i = _sounds[sound].group.sounds.indexOf(sound)
			_sounds[sound].group.sounds.slice(i, 1)
			_sounds[sound].pause()
			delete _sounds[sound]
		}
	}
	
	/**
	 * void removeChannel()
	 * void removeChannel(string channel)
	 */
	window.htmlaudio.removeChannel = function() {
		with (_(arguments,
				['channel'],
				[['string']])) {
			if (channel == undefined) {
				for (var s in _sounds) _sounds[s].pause(false, 0)
				_sounds = {}
				_groups = {}
				_channels = {}
				return
			}
			if (!_channels[channel]) return
			for (var g in _channels[channel].groups) {
				for (var s in _channels[channel].groups[g].sounds) {
					_sounds[_channels[channel].groups[g].sounds[s]].pause(false, 0)
					delete _sounds[_channels[channel].groups[g].sounds[s]]
				}
				delete _groups[_channels[channel].groups[g]]
			}
			delete _channels[channel]
		}
	}
	
	/**
	 * void removeGroup()
	 * void removeGroup(string group)
	 */
	window.htmlaudio.removeGroup = function() {
		with (_(arguments,
				['group'],
				[['string']])) {
			if (group == undefined) {
				for (var c in _channels) _channels[c].groups = []
				for (var s in _sounds) _sounds[s].pause(false, 0)
				_sounds = {}
				_groups = {}
				return
			}
			if (!_groups[group]) return
			for (var s in _groups[group].sounds) {
				_sounds[_groups[group].sounds[s]].pause(false, 0)
				delete _sounds[_group[group].sounds[s]]
			}
			delete _channels[channel]
		}
	}
	
	/**
	 * void stop()
	 * void stop(string sound)
	 * void stop(number fadeTime)
	 * void stop(string sound, number fadeTime)
	 */
	window.htmlaudio.stop = function() {
		with (_(arguments,
				['sound', 'fadeTime'],
				[['string'], ['number']])) {
			if (sound == undefined) {
				for (var s in _sounds) _sounds[s].pause(true, fadeTime)
				return
			}
			if (!_sounds[sound]) return
			_sounds[sound].pause(true, fadeTime)
		}
	}
	
	/**
	 * boolean supported()
	 */
	window.htmlaudio.supported = function() {
		return !!_extension;
	}
	
	/**
	 * string type()
	 * boolean type(string extension, string mime)
	 */
	window.htmlaudio.type = function() {
		with (_(arguments,
				['extension', 'mime'],
				[['string'], ['string']])) {
			if (extension == undefined || mime == undefined) return _type
			if (_type) return false
			try {
				var audioObj = new Audio('')
				if (!audioObj.canPlayType(mime)) return false
				_type = mime
				_extension = extension
			} catch(e) {
				return false
			}
			return true
		}
	}
	
	/**
	 * number volume()
	 * number volume(string channel)
	 * void volume(number volume)
	 * void volume(string channel, number volume)
	 */
	window.htmlaudio.volume = function() {
		with (_(arguments,
				['channel', 'volume'],
				[['string'], ['number']])) {
			if (channel == undefined) {
				if (volume == undefined) return _volume
				if (volume < 0 || volume > 1) volume = 1
				_volume = volume
				for (var c in _channels) _channels[c].volume(_channels[c].volume())
				return null
			}
			if (!_channels[channel]) return null
			if (volume == undefined) return _channels[c].volume()
			if (volume < 0 || volume > 1) volume = 1
			_channels[c].volume(volume)
			return null
		}
	}
};