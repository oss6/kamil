/*!
 * Kamil v0.1.1
 * Autocomplete library - pure JS
 * http://oss6.github.io/kamil
 * MIT License
 * by Ossama Edbali
 */

(function (window, document) {

    var defaults = {
        source: null,
        appendTo: null,
        disabled: false,
        autoFocus: false,
        minChars: 1,
        property: null,
        exclude: 'kamil-autocomplete-category',
        filter: function (text, input) {
            var re = new RegExp($.escapeRegex(input), 'i');
            return re.test(text);
        },
        sort: function (a, b) {
            var prop = this._opts.property,
                v1 = prop === null ? (a.label || a.value || a) : a[prop],
                v2 = prop === null ? (b.label || b.value || b) : b[prop];

            return v1.length - v2.length;
        }
    };

    // --- Helpers ---

    var $ = {
        extend: function (defaults, options) {
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

        escapeRegex: function (s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        },

        getItemValue: function (kamil, listItem) {
            var item = kamil._data[parseInt(listItem.getAttribute('data-position'))],
                prop = kamil._opts.property;

            if (typeof item !== 'undefined') {
                return prop === null ? (item['label'] || item['value'] || item) : item[prop];
            }
        },

        trigger: function (target, type, properties) {
            var evt = document.createEvent("HTMLEvents");

            evt.initEvent(type, true, true );

            for (var j in properties) {
                evt[j] = properties[j];
            }

            target.dispatchEvent(evt);
        },

        isActive: function (menu, idx) {
            var items = menu.getElementsByTagName('li'),
                len = items.length;

            if (typeof idx === 'string') {
                idx = idx === 'first' ? 0 : len - 1;
            }

            if (!items[idx]) {
                return null;
            }

            return items[idx].classList.contains('kamil-active');
        },

        noActive: function (menu) {
            return menu.getElementsByClassName('kamil-active').length === 0;
        },

        setActive: function (o) {
            if (o.item.classList.contains(this._opts.exclude)) {
                return;
            }

            // Search for active item
            var activeArr = this._menu.getElementsByClassName('kamil-active');

            if (activeArr.length !== 0) {
                activeArr[0].classList.remove('kamil-active');
            }

            o.item.classList.add('kamil-active');

            if (o.fillSource) {
                this._srcElement.value = $.getItemValue(this, o.item);
            }

            $.trigger(this._menu, 'kamilfocus', {
                item: this._data[parseInt(o.item.getAttribute('data-position'))],
                inputElement: this._srcElement
            });
        },

        move: function (direction) {
            if (!this.open) {
                this.start(null);
                return;
            }

            var items = this._menu.getElementsByTagName('li');

            // If out of bounds
            if (direction === 'previous' && $.isActive(this._menu, 'first') ||
                direction === 'next' && $.isActive(this._menu, 'last') ||
                direction === 'previous' && this._activeIndex === 1 && items[0].classList.contains(this._opts.exclude)) {
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

            if ($.noActive(this._menu) || this._activeIndex === null) {
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

            if (items[this._activeIndex] &&
                items[this._activeIndex].classList.contains(this._opts.exclude)) {
                this._activeIndex = this._activeIndex + (direction === 'previous' ? -1 : 1);
            }

            $.setActive.call(this, {
                item: items[this._activeIndex],
                fillSource: true
            });
        }
    };

    // --- Initialisation ---

    var init = {
        'source': function () {
            var source = this._opts.source;

            // Array
            if (source.constructor === Array) {
                this.source = source;
            }
            // String
            else {
                var list = document.querySelector(source),
                    children = list.children;

                this.source = [];
                for (var i = 0, l = children.length; i < l; i++) {
                    var item = children[i];
                    this.source.push(item.textContent);
                }
            }
        },

        'list': function () {
            var appendTo = this._opts.appendTo;

            this._menu = document.createElement('ul');
            this._menu.className = 'kamil-autocomplete';

            if (appendTo !== null) {
                document.querySelector(appendTo).appendChild(this._menu);
            }
            else {
                this._srcElement.parentNode.insertBefore(this._menu, this._srcElement.nextSibling);
            }
        }
    };

    // --- Handlers ---

    var handlers = {
        'keyup': function (k) {

            return function (e) {
                if (k._opts.disabled) { return; }

                switch (e.keyCode) {
                    // UP
                    case 38: $.move.call(k, 'previous', e); break;

                    // DOWN
                    case 40: $.move.call(k, 'next', e); break; // down

                    // ENTER
                    case 13:
                        var tmp = k._menu.getElementsByClassName('kamil-active');

                        if (tmp.length === 0) {
                            return;
                        }

                        var activeItem = tmp[0];
                        k._srcElement.value = $.getItemValue(k, activeItem);

                        // Trigger select event and override previous input value
                        $.trigger(k._menu, 'kamilselect', {
                            item: k._data[parseInt(activeItem.getAttribute('data-position'))],
                            inputElement: k._srcElement
                        });

                        k.close();
                        break;

                    // ESC
                    case 27:
                        k._srcElement.value = k.term;
                        k.close();
                        break;
                }
            }
        },

        'keydown': function (e) {
            if(e.keyCode === 38 || e.keyCode === 40) {
                e.preventDefault();
                return false;
            }
        },

        'input': function () {
            var self = this;

            return function () {
                if (self._opts.disabled) { return; }

                // Only search if the value has changed
                if (self.term !== self._srcElement.value || !self.open) {
                    self._activeIndex = null;
                    self.start(null);
                }
            }
        },

        'itemClickFlag': true,

        'mousedown': function () {
            handlers.itemClickFlag = false;
        },

        'mouseup': function (k) {
            return function () {
                handlers.itemClickFlag = true;

                k._srcElement.value = $.getItemValue(k, this);

                $.trigger(k._menu, 'kamilselect', {
                    item: k._data[parseInt(this.getAttribute('data-position'))],
                    inputElement: k._srcElement
                });

                k._srcElement.focus();
                k.close();
            };
        },

        'mouseover': function (k) {
            return function () {
                $.setActive.call(k, {
                    item: this,
                    fillSource: false
                });
            };
        },

        'mouseout': function (k) {
            return function () {
                var active = k._menu.getElementsByClassName('kamil-active')[0];

                if (active) {
                    active.classList.remove('kamil-active');
                }
            };
        },

        'blur': function (k) {
            return function () {
                if (k._opts.disabled || !handlers.itemClickFlag) {
                    return;
                }

                k.close();
            };
        }

    };

    // --- Kamil ---

    var Kamil = window.Kamil = function (element, options) {

        var self = this;

        // Initialise parameters
        self._opts = $.extend(defaults, options);
        self._activeIndex = null;
        self._data = null;
        self.open = false;

        // Initialise input element
        var srcElement = self._srcElement = typeof element === 'string' ? document.querySelector(element) : element;
        srcElement.addEventListener('input', handlers.input.call(self), false);
        srcElement.addEventListener('keyup', handlers.keyup(self), false);
        srcElement.addEventListener('keydown', handlers.keydown, false);
        srcElement.addEventListener('blur', handlers.blur(self), false);

        // Initialise source
        init.source.call(self);

        // Initialise list
        init.list.call(self);
    };

    Kamil.prototype._resizeMenu = function () {
        var style = this._menu.style;
        style.width = this._srcElement.offsetWidth + 'px';
        style.left = this._srcElement.offsetLeft + 'px';
        style.top = (this._srcElement.offsetTop + this._srcElement.offsetHeight) + 'px';
    };

    Kamil.prototype._renderItemData = function (ul, item, index) {
        var li = this.renderItem(ul, item);

        li.setAttribute('data-position', index);
        li.addEventListener('mousedown', handlers.mousedown, false);
        li.addEventListener('mouseup', handlers.mouseup(this), false);
        li.addEventListener('mouseover', handlers.mouseover(this), false);
        li.addEventListener('mouseout', handlers.mouseout(this), false);

        return li;
    };

    Kamil.prototype._renderMenu = function (items, callback) {
        var ls = this._menu;

        // Clear ul
        while (ls.firstChild) {
            ls.removeChild(ls.firstChild);
        }
        // ls.innerHTML = "";

        this._resizeMenu(); // Check this
        this.renderMenu(ls, items);

        if (ls.children.length === 0) {
            ls.style.display = 'none';
            return;
        }

        if (ls.style.display !== 'block') {
            ls.style.display = 'block';
        }

        callback();
    };

    // --- Methods ---

    Kamil.prototype.renderItem = function (ul, item) {
        var li = document.createElement('li');
        li.innerHTML = this._opts.property === null ? (item.label || item.value || item) : item[this._opts.property];
        ul.appendChild(li);

        return li;
    };

    Kamil.prototype.renderMenu = function (ul, items) {

        for (var i = 0, l = items.length; i < l; i++) {
            var item = items[i];
            this._renderItemData(ul, item, i);
        }

    };

    Kamil.prototype.start = function (value) {
        var self = this;

        // Get value
        value = value !== null ? value : self._srcElement.value;
        self.term = self._srcElement.value;

        // Disabled
        if (self._opts.disabled) { return; }

        // Empty value
        if (!value) {
            self.close();
            return;
        }

        // Minimum characters check
        if (value.length < self._opts.minChars) {
            self.close();
            return;
        }

        // Filter and sort data
        self._data = self.source.filter(function (e) {
            return self._opts.filter(self._opts.property === null ? (e.label || e.value || e) : e[self._opts.property], value);
        })
        .sort(function (a, b) { return self._opts.sort.call(self, a, b); });

        $.trigger(this._menu, 'kamilresponse', {
            content: self._data,
            inputElement: self._srcElement
        });

        self._renderMenu(self._data, function () {
            if (self._opts.autoFocus) {
                var items = self._menu.getElementsByTagName('li');

                $.setActive.call(self, {
                    item: items[0],
                    fillSource: false
                });
            }

            self.open = true;
            $.trigger(self._menu, 'kamilopen');
        });
    };

    Kamil.prototype.close = function () {
        if (this.open) {
            this._menu.style.display = 'none';
            this.open = false;

            // Trigger event
            $.trigger(this._menu, 'kamilclose');
        }
    };

    Kamil.prototype.destroy = function () {
        // Remove menu
        this._menu.remove();

        // Remove event listeners
        var srcElement = this._srcElement;
        srcElement.removeEventListener('input', handlers.input.call(this), false);
        srcElement.removeEventListener('keyup', handlers.keyup(this), false);
        srcElement.removeEventListener('keydown', handlers.keydown, false);
        srcElement.removeEventListener('blur', handlers.blur(this), false);
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

    Kamil.prototype.on = function (eventName, fn) {
        var self = this;

        self._menu.addEventListener(eventName, function (e) {
            if (eventName === 'kamilresponse') {
                self._data = fn(e);
            }
            else {
                fn(e);
            }
        }, false);
    };

})(window, document);
