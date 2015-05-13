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

    // Which element the menu should be appended to. When the value is null, the parents of the input field will be checked for a class of ui-front.
    // If an element with the ui-front class is found, the menu will be appended to that element.
    var defaults = {
        source: null, // array or string
        appendTo: null, // Which element the menu should be appended to
        delay: 300, // The delay in milliseconds between when a keystroke occurs and when a search is performed
        disabled: false, // Disables the autocomplete if set to true.
        autoFocus: false
    };

    var events = function (type) {
        return new CustomEvent(type);
    };

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

    var keyUpHandler = function (k) {
        return function (e) {
            if (k._opts.disabled) {
                return;
            }

            var keyCode = e.keyCode;

            switch (keyCode) {
                case 38:
                    move.call(k, 'previous', e);
                    break; // up
                case 40:
                    move.call(k, 'next', e);
                    break; // down
                case 13:
                    var tmp = k._menu.getElementsByClassName('kamil-active');

                    if (tmp.length === 0) {
                        return;
                    }

                    var activeItem = tmp[0];
                    k._srcElement.value = activeItem.innerHTML;
                    k.close();
                    break; // enter
                case 27:
                    k._srcElement.value = k.term;
                    k.close();
                    break; // esc
            }
        }
    };

    var inputHandler = function () {
        var self = this;

        return function (e) {
            if (self._opts.disabled) {
                return;
            }

            clearTimeout(self.searching);
            self.searching = setTimeout(function() {
                // Only search if the value has changed
                if (self.term !== self._srcElement.value) {
                    self._activeIndex = null;
                    self.start(null, e);
                }
            }, self._opts.delay);
        }
    };

    var itemClickFlag;

    var listItemMouseDownHandler = function () {
        itemClickFlag = false;
    };

    var listItemMouseUpHandler = function (k) {
        return function () {
            itemClickFlag = true;
            k._srcElement.value = this.innerHTML;
            k._srcElement.focus();
            k.close();
        };
    };

    var overItemHandler = function (k) {
        return function () {
            setActive.call(k, {
                item: this,
                fillSource: false
            });
        };
    };

    var outItemHandler = function (k) {
        return function () {
            k._menu.getElementsByClassName('kamil-active')[0].classList.remove('kamil-active');
        };
    };

    var blurHandler = function (k) {
        return function () {
            if (k._opts.disabled || !itemClickFlag) {
                return;
            }

            clearTimeout(k.searching);

            k.close();
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

    var setActive = function (o) {
        // Search for active item
        var activeArr = this._menu.getElementsByClassName('kamil-active');

        if (activeArr.length !== 0) {
            activeArr[0].classList.remove('kamil-active');
        }

        o.item.classList.add('kamil-active');

        if (o.fillSource) {
            this._srcElement.value = o.item.innerHTML;
        }

        var focus = new CustomEvent('kamilfocus', {
            detail: {
                item: o.item
            }
        });
        this._menu.dispatchEvent(focus);
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

        setActive.call(this, {
            item: items[this._activeIndex],
            fillSource: true
        });
    };

    // Present sorted (default), search beginning of word or just contains
    // callbacks:
    var Kamil = window.Kamil = function (element, options) {

        var self = this;

        // Initialise parameters
        self._opts = _.extend(defaults, options);
        var srcElement = self._srcElement = typeof element === 'string' ? document.querySelector(element) : element;
        srcElement.addEventListener('input', inputHandler.call(self), false);
        srcElement.addEventListener('keyup', keyUpHandler(self), false);
        srcElement.addEventListener('keydown', function(e) {
            if(e.keyCode === 38 || e.keyCode === 40) {
                e.preventDefault();
                return false;
            }
        }, false);
        srcElement.addEventListener('blur', blurHandler(self), false); // TODO: menu click triggers blur
        self.open = false;
        self.isNewMenu = true; // check
        self._activeIndex = null;

        // Initialise source
        initSource.call(self);

        // Initialise list
        initList.call(self);
    };

    Kamil.prototype._renderMenu = function (items, callback) {
        var ls = this._menu;

        // Clear ul
        while (ls.firstChild) {
            ls.removeChild(ls.firstChild);
        }

        if (ls.style.display !== 'block') {
            ls.style.display = 'block';
        }
        this._resizeMenu(); // Check this

        for (var i = 0, l = items.length; i < l; i++) {
            var itemText = items[i];

            // Render item here
            var li = document.createElement('li');
            li.innerHTML = itemText;
            li.addEventListener('mousedown', listItemMouseDownHandler, false);
            li.addEventListener('mouseup', listItemMouseUpHandler(this), false);
            li.addEventListener('mouseover', overItemHandler(this), false);
            li.addEventListener('mouseout', outItemHandler(this), false);

            ls.appendChild(li);
        }

        callback();
    };

    Kamil.prototype._resizeMenu = function () {
        this._menu.style.width = this._srcElement.offsetWidth + 'px';
        this._menu.style.left = this._srcElement.offsetLeft + 'px';
        this._menu.style.top = (this._srcElement.offsetTop + this._srcElement.offsetHeight) + 'px';
    };

    // triggers a search
    Kamil.prototype.start = function (value) {
        var self = this;

        value = value !== null ? value : this._srcElement.value;
        self.term = self._srcElement.value;

        if (self._opts.disabled) {
            return;
        }

        if (!value) {
            self.close();
            return;
        }

        // Trigger search event
        var data = self.source.filter(function (e) {
            var re = new RegExp(value, 'i');
            return re.test(e); //e.indexOf(value) !== -1; // Check this
        });

        // TODO: check this
        /*if (data.length === 0) {
            return;
        }*/

        self.open = true;
        self._renderMenu(data, function () {
            if (self._opts.autoFocus) {
                var items = self._menu.getElementsByTagName('li');

                setActive.call(self, {
                    item: items[0],
                    fillSource: false
                });
            }

            self._menu.dispatchEvent(events('kamilopen'));
        });
    };

    Kamil.prototype.destroy = function () {
        // Remove menu
        this._menu.remove();

        // Remove event listeners
        var srcElement = this._srcElement;
        srcElement.removeEventListener('input', inputHandler.call(this), false);
        srcElement.removeEventListener('keyup', keyUpHandler(this), false);
        // keyDown
        srcElement.removeEventListener('blur', blurHandler(self), false);
    };

    Kamil.prototype.close = function () {
        if (this._menu.style.display !== 'none') {
            this._menu.style.display = 'none';
            this.open = false;
            this.isNewMenu = true;

            // Trigger event
            this._menu.dispatchEvent(events('kamilclose'));
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

    Kamil.prototype.option = function () {
        switch (arguments.length) {
            case 0:
                return this._opts;
                break;

            case 1:
                return this._opts[arguments[0]];
                break;

            case 2:
                this._opts[arguments[0]] = arguments[1];
                break;
        }
    };

    // fn --> event, obj
    Kamil.prototype.on = function (eventName, fn) {
        this._menu.addEventListener(eventName, fn, false);
    };

})(window, document);