function Audio(src) {
	this.src = src;
	this._listeners = {};
}

Audio.prototype = {

    constructor: Audio,

    addEventListener: function(type, listener){
        if (typeof this._listeners[type] == "undefined"){
            this._listeners[type] = [];
        }

        this._listeners[type].push(listener);
    },
	
	canPlayType: function() {
		return true;
	},

    fire: function(event){
        if (this._listeners[event.type] instanceof Array){
            var listeners = this._listeners[event.type];
            for (var i=0, len=listeners.length; i < len; i++){
                listeners[i].call(this, event);
            }
        }
    },
	
	load: function() {
		this.fire("loadstart");
		this.fire("progress");
		this.fire("canplaythrough");
	},

    removeEventListener: function(type, listener){
        if (this._listeners[type] instanceof Array){
            var listeners = this._listeners[type];
            for (var i=0, len=listeners.length; i < len; i++){
                if (listeners[i] === listener){
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
    },

	play: function() {
		this.fire("play");
	},
	
	pause: function() {
		this.fire("pause");
	},
	
	stop: function() {
		this.fire("ended");
	}
};