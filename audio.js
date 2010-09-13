/******************************************************************************
           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                   Version 2, December 2004


Copyright (C) 2010 Tor Valamo <tor.valamo@gmail.com>
Everyone is permitted to copy and distribute verbatim or modified
copies of this license document, and changing it is allowed as long
as the name is changed.
 
           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
  TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
 
 0. You just DO WHAT THE FUCK YOU WANT TO.
******************************************************************************/

(function() {
	var htmlaudio = {};
	
	var _volume = 1.0;
	var _groups = {};
	var _layers = {};
    var _sounds = {};
	
	//////////////////////////////////////////////////////////////////////////
	// All-encompassing functions
	
	function canPlayType(mime) {
		try {
			var audioObj = new Audio('');
			return !!audioObj.canPlayType(mime);
		} catch(e) {
			return false;
		}
	}
	htmlaudio.canPlayType = canPlayType;
	
	function getGlobalVolume() {
		return _volume;
	}
	htmlaudio.getGlobalVolume = getGlobalVolume;
	
	function setGlobalVolume(volume) {
		// validate
		volume = !isNaN(volume) ? ((volume < 0) ? 0 :
								   (volume > 1) ? 1 : volume) : 1;
		_volume = volume;
		
		// adjust volume of all sounds
		for (var s in _sounds) {
			var v = 1;
			if (_sounds[s].group) {
				// if in a group, multiply with group volume
				v = _groups[_sounds[s].group].volume;
			} else if (_sounds[s].layer) {
				// if in a layer in a group, multiply with that layer's
				// group volume
				if (_layers[_sounds[s].layer].group) {
					v = _groups[_layers[_sounds[s].layer].group].volume;
				}
			}
			_sounds[s].volume = volume * v;
		}
	}
	htmlaudio.setGlobalVolume = setGlobalVolume;
	
	function kill() {
		for (var s in _sounds) {
			pauseSound(_sounds[s], false);
		}
	}
	htmlaudio.kill = kill;
	
	//////////////////////////////////////////////////////////////////////////
	// Group functions.
	
	function addGroup(name) {
		// validate
		name = name.toString ? name.toString() : name;
		if (_groups[name]) return false;
		
		_groups[name] = {
			volume: 1,
			sounds: [],
			layers: []
		};
		return true;
	}
	htmlaudio.addGroup = addGroup;
	
	function removeGroup(name) {
		// validate
		name = name.toString ? name.toString() : name;
		if (!_groups[name]) return false;
		
		// remove sounds
		for (var s in _groups[name].sounds) {
			removeSound(_groups[name].sounds[s]);
		}
		
		// remove layers
		for (var l in _groups[name].layers) {
			removeLayer(_groups[name].layers[l]);
		}
		
		delete _groups[name];
		return true;
	}
	htmlaudio.removeGroup = removeGroup;
	
	function getGroupVolume(name) {
		// validate
		name = name.toString ? name.toString() : name;
		if (!_groups[name]) return false;
		
		return _groups[name].volume;
	}
	htmlaudio.getGroupVolume = getGroupVolume;
	
	function setGroupVolume(name, volume) {
		// validate
		name = name.toString ? name.toString() : name;
		if (!_groups[name]) return false;
		volume = !isNaN(volume) ? ((volume < 0) ? 0 :
								   (volume > 1) ? 1 : volume) : 1;
		
		_groups[name].volume = volume;
		
		// multiply with global volume
		volume *= getGlobalVolume();
		
		// adjust volume for groups' sounds
		_groups[name].sounds.forEach(function(s) {
			_sounds[s].volume = volume;
		});
		
		// adjust volume for groups' layers' sounds
		for (var l in _groups[name].layers) {
			_layers[_groups[name].layers[l]].sounds.forEach(function(s) {
				_sounds[s].volume = volume;
			});
		}
		
		return true;
	}
	htmlaudio.setGroupVolume = setGroupVolume;
	
	//////////////////////////////////////////////////////////////////////////
	// Layer functions
	
	function addLayer(name, limit, group) {
		// validate
		name = name.toString ? name.toString() : name;
		if (_layers[name]) return false;
		if (!group && typeof limit === 'string') {
			// limit was omitted
			group = limit;
			limit = undefined;
		}
		if (!_groups[group]) return false;
		if (!limit || isNaN(limit) || limit < 1) limit = 1;
		
		_layers[name] = {
			limit: limit,
			playing: 0,
			group: group,
			sounds: []
		};
		
		_groups[group].layers.push(name);
		return true;
	}
	htmlaudio.addLayer = addLayer;
	
	function removeLayer(name) {
		// validate
		name = name.toString ? name.toString() : name;
		if (!_layers[name]) return false;
		
		// remove from group
		if (_layers[name].group) {
			var i = _groups[_layers[name].group].layers.indexOf(name);
			_groups[_layers[name].group].layers.splice(i, 1);
		}
		
		// remove sounds
		for (var s in _layers[name].sounds) {
			removeSound(_layers[name].sounds[s]);
		}
		
		delete _layers[name];
		return true;
	}
	htmlaudio.removeLayer = removeLayer;
	
	function setLayerLimit(name, limit) {
		// validate
		name = name.toString ? name.toString() : name;
		if (!_layers[name]) return false;
		if (isNaN(limit) || limit < 1) limit = 1;
		
		_layers[name].limit = limit;
		return true;
	}
	htmlaudio.setLayerLimit = setLayerLimit;
	
	//////////////////////////////////////////////////////////////////////////
	// Sound functions
	
	function _addSound(name, url, eventHandler) {
		// validate
		name = name.toString ? name.toString() : name;
		if (_sounds[name]) return false;
		if (typeof url !== 'string') return false;
		if (eventHandler && typeof eventHandler !== 'function') return false;
		
		var sound = new Audio(url);
		sound.loops = false;
		
		function ev(event) {
			// internal events
			switch(event) {
			case 'play':
				if (_sounds[name].layer) _layers[layer].playing++;
				break;
			case 'pause':
				if (_sounds[name].layer) _layers[layer].playing--;
				break;
			case 'ended':
				_sounds[name].currentTime = 0;
				if (_sounds[name].loops) return _sounds[name].play();
				if (_sounds[name].layer) _layers[layer].playing--;
				break;
			}
			if (eventHandler) eventHandler(event, name);
		}
		
		// add event listeners
		sound.addEventListener('error', function() {ev('error')}, false);
		sound.addEventListener('progress', function() {ev('progress')}, false);
		sound.addEventListener('canplaythrough', function () {ev('canplaythrough')}, false);
		sound.addEventListener('play', function() {ev('play')}, false);
		sound.addEventListener('pause', function() {ev('pause')}, false);
		sound.addEventListener('ended', function() {ev('ended')}, false);
		
		// load sound
        sound.load();
		_sounds[name] = sound;
        return true;
	}
	
	function addSound(name, url, layer, eventHandler) {
		// validate
		if (!eventHandler && typeof layer === 'function') {
			// layer was omitted
			eventHandler = layer;
			layer = undefined;
		}
		layer = layer.toString ? layer.toString() : layer;
		if (layer && !_layers[layer]) return false;
		
		if (!_addSound(name, url, eventHandler)) return false;
		
		var v = 1;
		// add sound to layer
		if (layer) {
			_sounds[name].layer = layer;
			_layers[layer].sounds.push(name);
			if (_layers[layer].group) v = _groups[_layers[layer].group].volume;
		}
		_sounds[name].volume = v * _volume;
		return true;
    };
	htmlaudio.addSound = addSound;
	
	function addSoundToGroup(name, url, group, eventHandler) {
		// validate
		group = group.toString ? group.toString() : group;
		if (group && !_groups[group]) return false;
		
		if (!_addSound(name, url, eventHandler)) return false;
		
		// add sound to group
		_sounds[name].group = group;
		_groups[group].sounds.push(name);
		_sounds[name].volume = _groups[group].volume * _volume;
		return true;
    };
	htmlaudio.addSoundToGroup = addSoundToGroup;
	
	function removeSound(name) {
		// validate
		name = name.toString ? name.toString() : name;
		if (!_sounds[name]) return false;
		
		// remove from group
		if (_sounds[name].group) {
			var i = _groups[_sounds[name].group].sounds.indexOf(name);
			_groups[_sounds[name].group].sounds.splice(i, 1);
		}
		
		// remove from layer
		if (_sounds[name].layer) {
			var i = _layers[_sounds[name].layer].sounds.indexOf(name);
			_layers[_sounds[name].layer].sounds.splice(i, 1);
		}
		
		pauseSound(name);
		delete _sounds[name];
		return true;
	}
	htmlaudio.removeSound = removeSound;
	
	function playSound(name, loop) {
		// validate
		name = name.toString ? name.toString() : name;
		if (!_sounds[name]) return false;
		if (typeof loop !== 'boolean') loop = false;
		
		// check that layer limit isn't reached
		if (_sounds[name].layer && _layer[_sounds[name].layer].playing
			>= _layer[_sounds[name].layer].limit) return false;
		
		_sounds[name].play();
		return true;
	}
	htmlaudio.playSound = playSound;
	
	function pauseSound(name, reset) {
		// validate
		name = name.toString ? name.toString() : name;
		if (!_sounds[name]) return false;
		if (typeof reset !== 'boolean') reset = false;
		
		_sounds[name].pause();
		if (reset) _sounds[name].currentTime = 0;
		return true;
	}
	htmlaudio.pauseSound = pauseSound;
	
	window.htmlaudio = htmlaudio;
};