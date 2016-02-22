define('pro.web.client.state', ['pro', 'pro.collections'], function (pro, collections) {
    "use strict";
    pro.module('state', pro.object()).module('client', pro.object({
        extend: pro.extend,
        session: pro.object({
            init: function (globalIdentifier) {
                if (globalIdentifier) {
                    this.id = globalIdentifier.toString();
                }
                return this;
            },
            id: 'defaultIdentifier',
            lookup: new collections.dictionary(),
            add: function (key, value) {
                if (key && value) {
                    this.deserialize().lookup.add(key, value);
                }
                this.serialize();
                return this;
            },
            get: function (key) {
                this.deserialize();
                var match = null;
                if (key) {
                    match = this.lookup.get(key);
                    if (match) {
                        match = match.value;
                    }
                }
                return match;
            },
            remove: function (key) {
                this.deserialize();
                var match = null;
                if (key) {
                    this.lookup.remove(key);
                    this.serialize();
                }
            },
            serialize: function () {
                if (global.sessionStorage) {
                    global.sessionStorage.setItem(this.id, pro.toJson(this.lookup.toArray()));
                }
                return this;
            },
            deserialize: function () {
                if (global.sessionStorage && pro.parseJson(global.sessionStorage.getItem(this.id))) {
                    this.lookup = collections.asEnumerable(pro.parseJson(global.sessionStorage.getItem(this.id))).toDictionary();
                }
                return this;
            }
        }),
        local: pro.object({
            init: function (globalIdentifier) {
                if (globalIdentifier) {
                    this.id = globalIdentifier.toString();
                }
                return this;
            },
            id: 'defaultIdentifier',
            lookup: new collections.dictionary(),
            add: function (key, value) {
                if (key && value) {
                    this.deserialize().lookup.add(key, value);
                }
                this.serialize();
                return this;
            },
            get: function (key) {
                this.deserialize();
                var match = null;
                if (key) {
                    match = this.lookup.get(key);
                    if (match) {
                        match = match.value;
                    }
                }
                return match;
            },
            remove: function (key) {
                this.deserialize();
                var match = null;
                if (key) {
                    this.lookup.remove(key);
                    this.serialize();
                }
            },
            serialize: function () {
                if (global.localStorage) {
                    global.localStorage.setItem(this.id, pro.toJson(this.lookup.toArray()));
                }
                return this;
            },
            deserialize: function () {
                if (global.localStorage && pro.parseJson(global.localStorage.getItem(this.id))) {
                    this.lookup = collections.asEnumerable(pro.parseJson(global.localStorage.getItem(this.id))).toDictionary();
                }
                return this;
            }
        }),
        init: function () {
            var _state = this;
            if (global.addEventListener) {
                global.addEventListener("beforeunload", function (e) {
                    _state.session.serialize();
                    _state.local.serialize();
                });
            }
            return this;
        }
    }));
    return pro.state.client;
});