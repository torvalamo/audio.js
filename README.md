When using this library you can choose between two different files.

* simpleaudio.js - This only loads individual sounds and plays them.
* audio.js - This has a bunch of other features which you can read about below.

To include it in your html document, just add

    <script src="simpleaudio.js"></script>`

in your `<head>` tag.

## simpleaudio.js

Simpleaudio determines whether the browser can play .ogg or .mp3, and loads
the relevant file. This allows you to play sounds in all the latest browsers
supporting HTML5Audio, but it also requires that you have two files per sound
on the server.

* `void htmlaudio.addSound(string name, string url[, callback eventHandler])`
* * _url_ must not have an extension!
* * Info on _eventHandler_ can be found further down in this document.
* `void htmlaudio.playSound(string name)`

ex: `htmlaudio.addSound('mysound', '/sounds/mysound');`

This will load either /sounds/mysound.ogg or /sounds/mysound.mp3 depending on
which filetype the browser can play. In case of both, .ogg is preferred, due to
smaller size.

The two libraries are not interoperable at the moment, so if you want to only
load specific filetypes, you need to use audio.js.

## audio.js

Audio.js has 4 distinct sections:

### Global

This sets the global volume, similar to a "Main Volume" slider in various
games or your OS. It also lets you determine if the browser supports a
given audio type.

All volume values must be between 0 and 1 (ex. 0.67), and the default is
always 1.

* `float htmlaudio.getGlobalVolume()`
* `void htmlaudio.setGlobalVolume(float volume)`
* `bool htmlaudio.supportsType(string mime)`
* * _mime_ is a mime type, such as 'audio/ogg' or 'audio/mp3'.

### Groups (volume groups)

A group is what you in your game would see as "Background Music",
"Background Sounds", "Sound FX", "Speech", etc. Each group has its own
volume setting, which is the main purpose of having a group. You can skip
these features if you don't need them.

* `bool htmlaudio.addGroup(string name)`
* `bool htmlaudio.removeGroup(string name)`
* * This also removes all sounds belonging to the group.
* `float htmlaudio.getGroupVolume(string name)`
* `void htmlaudio.setGroupVolume(string name, float volume)`

### Layers

Layers are groups of sounds that should only play a given number of sounds
at once. For instance if you have a "crowd", you don't want to play one
sound per person. That would be a mess.

* `bool htmlaudio.addLayer(string name[, integer limit][, string group])`
* * Default _limit_ is 1, and must be at least 1.
* `bool htmlaudio.removeLayer(string name)`
* * This also removes all sounds belonging to the layer.
* `bool htmlaudio.setLayerLimit(string name, integer limit)`

### Sounds

These are the actual sound files. A sound can belong to a group or a layer,
or it can be on its own.

It is recommended that only layers are added to groups, and that sounds are
added to layers, to prevent a dozen sounds playing at once.

* `bool htmlaudio.addSound(string name, string url[, string layer][, callback eventHandler])`
* `bool htmlaudio.addSoundToGroup(string name, string url, string group[, callback eventHandler])`
* `bool htmlaudio.removeSound(string name)`
* `bool htmlaudio.playSound(string name[, bool loop])`
* * _loop_ determines if the sound should repeat when ended. Default is false.
* `bool htmlaudio.pauseSound(string name[, bool reset])`
* * _reset_ determines if pauseSound should act like a stop. Default is true. 

## eventHandler
	
The eventHandler callback function when adding sounds is called with two
arguments, _event_ and _sound name_, where _event_ is one of the following:

- "error": There was an error in loading the file (eg. doesn't exist).
- "loading": The file has started loading.
- "ready": The browser estimates it has downloaded enough of the file that it
can play through it. This does not necessarily mean that it is fully loaded,
only in some browsers.
- "play": The sound starts playing or has looped back to the beginning.
- "pause": The sound has paused.
- "ended": The sound has reached the end and is not set for looping.

See examples/simpleaudio.html for an example of event handling.

## License

    DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
    Version 2, December 2004
    
    Copyright (C) 2010 Tor Valamo <tor.valamo@gmail.com>
    Everyone is permitted to copy and distribute verbatim or modified
    copies of this license document, and changing it is allowed as long
    as the name is changed.
    
    DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
    TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
    
    0. You just DO WHAT THE FUCK YOU WANT TO.