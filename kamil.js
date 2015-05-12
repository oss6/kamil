/*!
 * Kamil v0.0.1
 * Autocomplete library - pure JS
 * http://oss6.github.io/kamil
 * MIT License
 * by Ossama Edbali
 */

// addEventListener polyfill 1.0 / Eirik Backer / MIT Licence
(function(win, doc){
    if(win.addEventListener)return;		//No need to polyfill

    function docHijack(p){var old = doc[p];doc[p] = function(v){return addListen(old(v))}}
    function addEvent(on, fn, self){
        return (self = this).attachEvent('on' + on, function(e){
            var e = e || win.event;
            e.preventDefault  = e.preventDefault  || function(){e.returnValue = false}
            e.stopPropagation = e.stopPropagation || function(){e.cancelBubble = true}
            fn.call(self, e);
        });
    }
    function addListen(obj, i){
        if(i = obj.length)while(i--)obj[i].addEventListener = addEvent;
        else obj.addEventListener = addEvent;
        return obj;
    }

    addListen([doc, win]);
    if('Element' in win)win.Element.prototype.addEventListener = addEvent;			//IE8
    else{																			//IE < 8
        doc.attachEvent('onreadystatechange', function(){addListen(doc.all)});		//Make sure we also init at domReady
        docHijack('getElementsByTagName');
        docHijack('getElementById');
        docHijack('createElement');
        addListen(doc.all);
    }
})(window, document);

(function (window, document, undefined) {

    // Filter polyfill
    if (!Array.prototype.filter) {
        Array.prototype.filter = function(fun/*, thisArg*/) {
            'use strict';

            if (this === void 0 || this === null) {
                throw new TypeError();
            }

            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fun !== 'function') {
                throw new TypeError();
            }

            var res = [];
            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    var val = t[i];

                    // NOTE: Technically this should Object.defineProperty at
                    //       the next index, as push can be affected by
                    //       properties on Object.prototype and Array.prototype.
                    //       But that method's new, and collisions should be
                    //       rare, so use the more-compatible alternative.
                    if (fun.call(thisArg, val, i, t)) {
                        res.push(val);
                    }
                }
            }

            return res;
        };
    }

    // Utils
    var _ = {
        'extend': function (defaults, options) {
            var extended = {};
            var prop;
            for (prop in defaults) {
                if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                    extended[prop] = defaults[prop];
                }
            }
            for (prop in options) {
                if (Object.prototype.hasOwnProperty.call(options, prop)) {
                    extended[prop] = options[prop];
                }
            }
            return extended;
        },

        'css': function (element, o) {

        }
    };

    // Which element the menu should be appended to. When the value is null, the parents of the input field will be checked for a class of ui-front.
    // If an element with the ui-front class is found, the menu will be appended to that element.
    var defaults = {
        source: null, // array or string
        appendTo: null, // Which element the menu should be appended to
        delay: 300, // The delay in milliseconds between when a keystroke occurs and when a search is performed
        disabled: false // Disables the autocomplete if set to true.
    };

    var initSource = function (source) {

        if (source.constructor === Array) {
            this._source = source;
        }
        // String
        else {

        }

    };

    var initList = function (appendTo) {
        this._list = document.createElement('ul');
        this._list.className = 'kamil-autocomplete';
        if (appendTo !== null) {
            var parent = document.querySelector(appendTo);
            parent.appendChild(this._list);
        }
        else {
            this._srcElement.parentNode.insertBefore(this._list, this._srcElement.nextSibling);
        }
    };

    // Present sorted (default), search beginning of word or just contains
    // callbacks:
    var Kamil = window.Kamil = function (element, options) {

        // Initialise parameters
        var opts = _.extend(defaults, options),
            self = this;
        this._srcElement = typeof element === 'string' ? document.querySelector(element) : element;

        // Initialise source
        initSource.call(self, opts.source);

        // Initialise list
        initList.call(self, opts.appendTo);

        // Add event listener for input element
        this._srcElement.addEventListener('keyup', function () {
            if (!opts.disabled) {
                var val = this.value;

                self._renderMenu(opts.source.filter(function (e) {
                    return e.indexOf(val) !== -1;
                }));
            }
        });
    };

    Kamil.prototype._renderMenu = function (items) {
        var ls = this._list;

        // Clear ul
        while (ls.firstChild) {
            ls.removeChild(ls.firstChild);
        }

        for (var i = 0, l = items.length; i < l; i++) {
            var itemText = items[i];

            // Render item here
            var li = document.createElement('li');
            li.innerHTML = itemText;

            ls.appendChild(li);
        }
    };

    Kamil.prototype.close = function () {

    };

    Kamil.prototype.disable = function () {

    };

    Kamil.prototype.enable = function () {

    };

    Kamil.prototype.isEnabled = function () {

    };

    // option(name) -> getter
    // option(name, value); -> setter
    Kamil.prototype.option = function () {

    };

    // triggers a search
    Kamil.prototype.start = function () {

    };



})(window, document);