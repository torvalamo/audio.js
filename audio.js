(function (root) {
  var audio = root.audio = {
    FADE_LINEAR      : 0,
    FADE_LOGARITHMIC : 1,
    FADE_EXPONENTIAL : 2
  }

  /**
   * Accepted file extensions
   **/
  var __mime_types = {
    '3gp' : 'audio/3gpp',
    '3g2' : 'audio/3gpp2',
    'aac' : 'audio/aac',
    'm4a' : 'audio/mp4',
    'mp3' : 'audio/mpeg',
    'mp4' : 'audio/mp4',
    'oga' : 'audio/ogg',
    'ogg' : 'audio/ogg',
    'spx' : 'audio/speex',
    'wav' : 'audio/wav'
  }

  /**
   * Global settings
   **/
  var __default = {
    volume    : 1.0,
    fadeTime  : 0,
    fadeCurve : audio.FADE_LINEAR
  }
  var _extensions = ['ogg', 'mp3']
  var _fadeResolution = 10
  var _path = './'
  var _selectedExtension = null

  /**
   * Internal functions
   **/
  function _selectExtension(extensions) {
    var i = 0, len = extensions.length
    try {
      for (; i < len; i++) {
        var audioObj = new Audio('')
        if (audioObj.canPlayType(__mime_types[extensions[i]])) {
          _selectedExtension = extensions[i]
          break
        }
      }
    } catch (e) {
      _selectedExtension = null
    }
  }

  _selectExtension(_extensions) // invoke using default

  /**
   * Global functions
   **/
  audio.extensions = function (extensions) {
    // Get or set the preferred file extensions (in descending order, most preferred first)
    if (!extensions) return _extensions
    if (!(extensions instanceof Array)) return _extensions
    _extensions = extensions
    _selectExtension(_extensions)
  }

  audio.fadeResolution = function (fadeResolution) {
    // Get or set the fade resolution in milliseconds
    if (!fadeResolution) return _fadeResolution
    _fadeResolution = Math.ceil(Math.abs(fadeResolution))
  }

  audio.path = function (path) {
    // Get or set the path of the root sound directory
    if (!path) return _path
    if (path.substr(-1) != '/') path += '/'
    _path = path
  }

  audio.selectedExtension = function () {
    // Get the extension that was selected from the set of preferred extensions (debugging function)
    return _selectedExtension
  }

  /**
   * Master
   **/
  var master = audio.master = {
    _volume    : __default.volume,
    _fadeTime  : __default.fadeTime,
    _fadeCurve : __default.fadeCurve,
    fadeAll    : function () {
      // fade out and stop all sounds, using the master fade settings, then return the sound level back to normal
      //
    },
    fadeTime   : function (fadeTime) {
      // Get or set the master/global fade time
      if (fadeTime == undefined) return this._fadeTime
      fadeTime = Math.ceil(Math.abs(fadeTime))
      this._fadeTime = fadeTime
    },
    fadeCurve  : function (fadeCurve) {
      // Get or set the master/global fade curve
      if (fadeCurve == undefined) return this._fadeCurve
      if (fadeCurve >= 1 && fadeCurve <= 3) this._fadeCurve = Math.round(fadeCurve)
    },
    volume     : function (volume) {
      // Get or set the master volume
      if (typeof volume != 'number') return this._volume
      if (volume < 0 || volume > 1) volume = __default.volume
      this._volume = volume
      Object.keys(groups).forEach(function (group) {
        audio.group(group)._adjustVolume(volume)
      })
    }
  }

  /**
   * Groups
   **/
  var groups = {}

  function Group(name) {
    this._channels = {}
    this._volume = __default.volume
  }

  Group.prototype._adjustVolume = function (volume) {
    volume = this._volume * volume
    Object.keys(this._channels).forEach(function(channel) {
      audio.channel(channel)._adjustVolume(volume)
    })
  }

  Group.prototype.fadeAll = function () {
    // fade out and stop all sounds in the group, then return the sound level back to normal
  }

  Group.prototype.volume = function (volume) {
    // Get or set the group volume
    if (typeof volume != 'number') return this._volume
    if (volume < 0 || volume > 1) volume = __default.volume
    this._volume = volume
    this._adjustVolume(master._volume)
  }

  audio.group = function (name, create) {
    // return group or create one if one by that name does not exist and create is true
    if (!groups[name]) {
      if (create) groups[name] = new Group(name)
      else return
    }
    return groups[name]
  }

  audio.groups = function () {
    // return array of all group names, not sorted
    return Object.keys(groups)
  }

}(this))