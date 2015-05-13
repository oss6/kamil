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

    var initSource = function () {
        var source = this._opts.source;

        if (source.constructor === Array) {
            this.source = source;
        }
        // String
        else {

        }

    };

    var initList = function () {
        var appendTo = this._opts.appendTo;

        this._menu = document.createElement('ul');
        this._menu.className = 'kamil-autocomplete';
        if (appendTo !== null) {
            var parent = document.querySelector(appendTo);
            parent.appendChild(this._menu);
        }
        else {
            this._srcElement.parentNode.insertBefore(this._menu, this._srcElement.nextSibling);
        }
    };

    // TODO: prevent default
    var upDown = function (k) {
        return function (e) {
            var keyCode = e.keyCode;

            switch (keyCode) {
                case 38:
                    move.call(k, 'previous', e);
                    e.preventDefault();
                    return false; // up
                case 40:
                    move.call(k, 'next', e);
                    e.preventDefault();
                    return false; // down
                    // TODO: Enter
                case 27:
                    k._srcElement.value = k.term;
                    k.close(e);
                    break; // esc
            }
        }
    };

    var listItemClick = function (k) {
        return function (e) {
            k._srcElement.value = this.innerHTML;
            k._srcElement.focus();
            k.close(e);
        };
    };

    var blurHandler = function (k) {
        return function (e) {
            if (k._opts.disabled) {
                return;
            }

            k.close(e);
        };
    };

    var isActive = function (menu, idx) {
        var items = menu.getElementsByTagName('li'),
            len = items.length;

        if (typeof idx === 'string') {
            idx = idx === 'first' ? 0 : len - 1;
        }

        if (!items[idx]) {
            return null;
        }

        return items[idx].classList.contains('kamil-active');
    };

    var noActive = function (menu) {
        return menu.getElementsByClassName('kamil-active').length === 0;
    };

    var move = function (direction, event) {
        if (this._menu.style.display === 'none') {
            this.start(null, event);
            return;
        }

        var items = this._menu.getElementsByTagName('li');

        if (direction === 'previous' && isActive(this._menu, 'first') ||
            direction === 'next' && isActive(this._menu, 'last')) {
            this._srcElement.value = this.term;
            this._activeIndex = null;

            // Remove active list item
            for (var i = 0, l = items.length; i < l; i++) {
                if (items[i].classList.contains('kamil-active')) {
                    items[i].classList.remove('kamil-active');
                }
            }
            return;
        }

        var previousIndex = this._activeIndex;
        if (noActive(this._menu) || this._activeIndex === null) {
            // From bottom
            if (direction === 'previous') {
                this._activeIndex = items.length - 1;
            }
            // From top
            else if (direction === 'next') {
                this._activeIndex = 0;
            }
        }
        else {
            this._activeIndex = this._activeIndex + (direction === 'previous' ? -1 : 1);
        }

        if (previousIndex !== null) {
            items[previousIndex].classList.remove('kamil-active');
        }
        items[this._activeIndex].classList.add('kamil-active');
        this._srcElement.value = items[this._activeIndex].innerHTML;
    };

    // Present sorted (default), search beginning of word or just contains
    // callbacks:
    var Kamil = window.Kamil = function (element, options) {

        var self = this;

        // Initialise parameters
        self._opts = _.extend(defaults, options);
        var srcElement = self._srcElement = typeof element === 'string' ? document.querySelector(element) : element;
        srcElement.addEventListener('input', function () { self.start(null) }, false);
        srcElement.addEventListener('keyup', upDown(self), false);
        srcElement.addEventListener('blur', blurHandler(self), false); // TODO: menu click triggers blur
        self.open = false;
        self.isNewMenu = true; // check
        self._activeIndex = null;

        // Initialise source
        initSource.call(self);

        // Initialise list
        initList.call(self);
    };

    Kamil.prototype._renderMenu = function (items) {
        var ls = this._menu;

        // Clear ul
        while (ls.firstChild) {
            ls.removeChild(ls.firstChild);
        }

        if (ls.style.display !== 'block') {
            ls.style.display = 'block';
        }
        this.resizeMenu(); // Check this

        for (var i = 0, l = items.length; i < l; i++) {
            var itemText = items[i];

            // Render item here
            var li = document.createElement('li');
            li.innerHTML = itemText;
            li.addEventListener('click', listItemClick(this), false);

            ls.appendChild(li);
        }
    };

    // triggers a search
    Kamil.prototype.start = function (value, event) {
        value = value !== null ? value : this._srcElement.value;
        this.term = this._srcElement.value;

        console.log(value);

        if (this._opts.disabled) {
            return;
        }

        if (!value) {
            this.close();
            return;
        }

        // Trigger search event

        this._renderMenu(this.source.filter(function (e) {
            var re = new RegExp(value, 'i');
            return re.test(e); //e.indexOf(value) !== -1; // Check this
        }));
    };

    Kamil.prototype.close = function (event) {
        if (this._menu.style.display !== 'none') {
            this._menu.style.display = 'none';
            this.isNewMenu = true;
            // Trigger close (event)
        }
    };

    Kamil.prototype.disable = function () {
        if (this._menu.style.display !== 'none') {
            this._menu.style.display = 'none';
        }
        this._opts.disabled = true;
    };

    Kamil.prototype.enable = function () {
        this._opts.disabled = false;
    };

    Kamil.prototype.isEnabled = function () {
        return !this._opts.disabled;
    };

    // option(name) -> getter
    // option(name, value); -> setter
    Kamil.prototype.option = function () {

    };

    Kamil.prototype.resizeMenu = function () {
        this._menu.style.width = this._srcElement.offsetWidth + 'px';
        this._menu.style.left = this._srcElement.offsetLeft + 'px';
        this._menu.style.top = (this._srcElement.offsetTop + this._srcElement.offsetHeight) + 'px';
    };

})(window, document);