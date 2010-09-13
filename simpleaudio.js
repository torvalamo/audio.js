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
	var _sounds = {};
	
	function addSound(name, url, events) {
		// Register a sound, located at url, with the given name.
		// Url should not have an extension.
		// We will determine which extension to load depending on the browser.
		// There should be .ogg and .mp3 files available for each sound.
		// This function will fail silently.
		try {
			var audioObj = new Audio('');
			if (audioObj.canPlayType('audio/ogg')) url += '.ogg';
			else if (audioObj.canPlayType('audio/mpeg')) url += '.mp3';
			else return;
		
			_sounds[name] = new Audio(url);
			
			// add event listeners
			if (!events) return;
			_sounds[name].addEventListener("error", function() {
				events("error", name);
			}, false);
			_sounds[name].addEventListener("progress", function () {
				events("loading", name);
			}, false);
			_sounds[name].addEventListener("canplaythrough", function () {
				events("ready", name);
			}, false);
			_sounds[name].addEventListener("play", function () {
				events("play", name);
			}, false);
			_sounds[name].addEventListener("pause", function () {
				events("pause", name);
			}, false);
			_sounds[name].addEventListener("ended", function () {
				events("ended", name);
			}, false);
		} catch (e) {}
	}
	
	function playSound(name) {
		// Play sound registered with given name.
		// This function will fail silently.
		try {
			if (!_sounds[name]) return;
			_sounds[name].play();
		} catch (e) {}
	}
	
	htmlaudio.addSound = addSound;
	htmlaudio.playSound = playSound;
	
	window.htmlaudio = htmlaudio;
}());