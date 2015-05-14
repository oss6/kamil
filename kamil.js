/*!
 * Kamil v0.0.1
 * Autocomplete library - pure JS
 * http://oss6.github.io/kamil
 * MIT License
 * by Ossama Edbali
 */

// TODO:
// - custom renderItem and renderMenu
// - categories
// - tag functionality
// -

(function (window, document, undefined) {

    // Which element the menu should be appended to. When the value is null, the parents of the input field will be checked for a class of ui-front.
    // If an element with the ui-front class is found, the menu will be appended to that element.
    var defaults = {
        source: null, // array or string
        appendTo: null, // Which element the menu should be appended to
        delay: 300, // The delay in milliseconds between when a keystroke occurs and when a search is performed
        disabled: false, // Disables the autocomplete if set to true.
        autoFocus: false,
        matchFirst: false,
        valueProp: null
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
                    k._srcElement.value = activeItem.textContent || activeItem.innerText;
                    k.close();
                    break; // enter
                case 27:
                    k._srcElement.value = k.term;
                    k.close();
                    break; // esc
            }
        }
    };

    var keyDownHandler = function (e) {
        if(e.keyCode === 38 || e.keyCode === 40) {
            e.preventDefault();
            return false;
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

    var itemClickFlag = true;

    var listItemMouseDownHandler = function () {
        itemClickFlag = false;
    };

    var listItemMouseUpHandler = function (k) {
        return function () {
            itemClickFlag = true;
            k._srcElement.value = this.textContent || this.innerText;
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
            this._srcElement.value = o.item.textContent || o.item.innerText;
        }

        var focus = new CustomEvent('kamilfocus', {
            detail: {
                item: this._data // TODO: pass item object (not array)
            }
        });
        this._menu.dispatchEvent(focus);
    };

    var move = function (direction, event) {
        if (!this.open) { // this._menu.style.display === 'none'
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

        //var previousIndex = this._activeIndex;
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
        self._activeIndex = null;
        self._data = null;
        self.open = false;

        // Initialise input element
        var srcElement = self._srcElement = typeof element === 'string' ? document.querySelector(element) : element;
        srcElement.addEventListener('input', inputHandler.call(self), false);
        srcElement.addEventListener('keyup', keyUpHandler(self), false);
        srcElement.addEventListener('keydown', keyDownHandler, false);
        srcElement.addEventListener('blur', blurHandler(self), false);

        // Initialise source
        initSource.call(self);

        // Initialise list
        initList.call(self);
    };

    Kamil.prototype._resizeMenu = function () {
        this._menu.style.width = this._srcElement.offsetWidth + 'px';
        this._menu.style.left = this._srcElement.offsetLeft + 'px';
        this._menu.style.top = (this._srcElement.offsetTop + this._srcElement.offsetHeight) + 'px';
        console.log(this._menu.style.zIndex);
        //this._srcElement.style.zIndex = this._menu
    };

    Kamil.prototype._renderItemData = function (ul, item) {
        var li = this.renderItem(ul, item);
        li.addEventListener('mousedown', listItemMouseDownHandler, false);
        li.addEventListener('mouseup', listItemMouseUpHandler(this), false);
        li.addEventListener('mouseover', overItemHandler(this), false);
        li.addEventListener('mouseout', outItemHandler(this), false);
    };

    Kamil.prototype._renderMenu = function (items, callback) {
        var ls = this._menu;

        // Clear ul
        while (ls.firstChild) {
            ls.removeChild(ls.firstChild);
        }

        this._resizeMenu(); // Check this
        this.renderMenu(ls, items);

        if (ls.style.display !== 'block') {
            ls.style.display = 'block';
        }

        callback();
    };

    Kamil.prototype.renderItem = function (ul, item) {
        var li = document.createElement('li');
        li.innerHTML = item;
        ul.appendChild(li);

        return li;
    };

    Kamil.prototype.renderMenu = function (ul, items) {

        for (var i = 0, l = items.length; i < l; i++) {
            var item = items[i];
            this._renderItemData(ul, item);
        }

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
        self._data = self.source.filter(function (e) { // var data
            var re = new RegExp(self._opts.matchFirst ? '^' + value : value, 'i');
            return re.test(self._opts.valueProp === null ? (e.label || e.value || e) : e[self._opts.valueProp]);
        });

        // TODO: check this
        /*if (data.length === 0) {
            return;
        }*/

        var kamilResponse = new CustomEvent('kamilresponse', {
            detail: {
                content: self._data // data
            }
        });
        this._menu.dispatchEvent(kamilResponse);

        self._renderMenu(self._data, function () { // data
            if (self._opts.autoFocus) {
                var items = self._menu.getElementsByTagName('li');

                setActive.call(self, {
                    item: items[0],
                    fillSource: false
                });
            }

            self.open = true;
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
        srcElement.removeEventListener('keydown', keyDownHandler, false);
        srcElement.removeEventListener('blur', blurHandler(self), false);
    };

    Kamil.prototype.close = function () {
        if (this.open) { // this._menu.style.display !== 'none'
            this._menu.style.display = 'none';
            this.open = false;

            // Trigger event
            this._menu.dispatchEvent(events('kamilclose'));
        }
    };

    Kamil.prototype.disable = function () {
        this.close();
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