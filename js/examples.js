var examples = (function () {

    var

        tags = [
            "ActionScript",
            "AppleScript",
            "Asp",
            "BASIC",
            "C",
            "C++",
            "Clojure",
            "COBOL",
            "ColdFusion",
            "Erlang",
            "Fortran",
            "Groovy",
            "Haskell",
            "Java",
            "JavaScript",
            "Lisp",
            "Perl",
            "PHP",
            "Python",
            "Ruby",
            "Scala",
            "Scheme"
        ],

        tags1 = [
            {
                label: "jQuery",
                desc: "the write less, do more, JavaScript library"
            },
            {
                label: "jQuery UI",
                desc: "the official user interface library for jQuery"
            },
            {
                label: "Sizzle JS",
                desc: "a pure-JavaScript CSS selector engine"
            }
        ],

        example = function (num, opts) {
            var autoComplete = new Kamil('#tags' + num, opts);
        },

        example5 = function () {
            var autoComplete = new Kamil('#tags5', {
                source: tags1
            });

            autoComplete.renderItem = function (ul, item) {
                var li = document.createElement('li');
                li.innerHTML = "<a>" + item.label + "<br><small>" + item.desc + "</small></a>";
                ul.appendChild(li);

                return li;
            };

            autoComplete.on('kamilfocus', function (e) {
                e.inputElement.value = e.item.label;
            });

            autoComplete.on('kamilselect', function (e) {
                e.inputElement.value = e.item.label;
            });
        },

        example6 = function () {
            var autoComplete = new Kamil('#tags6', {
                source: tags
            });

            autoComplete.renderMenu = function (ul, items) {
                var i, l;

                // Render items
                for (i = 0, l = items.length; i < l; i++) {
                    this._renderItemData(ul, items[i], i);
                }

                // Striped menu
                var listItems = ul.getElementsByTagName('li');
                for (i = 0, l = listItems.length; i < l; i++) {
                    if (i % 2 === 0) {
                        listItems[i].classList.add('striped-even');
                    }
                }
            }
        },

        example7 = function () {
            var data = [
                    { label: "anders", category: "" },
                    { label: "andreas", category: "" },
                    { label: "antal", category: "" },
                    { label: "annhhx10", category: "Products" },
                    { label: "annk K12", category: "Products" },
                    { label: "annttop C13", category: "Products" },
                    { label: "anders andersson", category: "People" },
                    { label: "andreas andersson", category: "People" },
                    { label: "andreas johnson", category: "People" }
                ],
                ac = new Kamil('#tags7', {
                    source: data
                });

            ac.renderMenu = function (ul, items) {
                var self = this,
                    currentCategory = "";

                items.forEach(function (item, index) {
                    var li;

                    if (item.category !== currentCategory) {
                        var catLi = document.createElement('li');
                        catLi.className = 'kamil-autocomplete-category';
                        catLi.innerHTML = item.category;

                        ul.appendChild(catLi);
                        currentCategory = item.category;
                    }
                    li = self._renderItemData(ul, item, index);
                    if (item.category) {
                        li.setAttribute('aria-label', item.category + ' : ' + item.label);
                    }
                });
            };
        },

        init = function () {

            example(1, { source: tags });
            example(2, { source: tags, autoFocus: true });
            example(3, { source: tags, minChars: 2 });
            example(4, {
                source: tags,
                sort: function (a, b) {
                    return a.localeCompare(b);
                }
            });
            example5();
            example6();
            example7();

        };

    return {
        'init': init
    }

})();

window.onload = examples.init;

/*window.onload = function () {
    var tags = [
        {
            label: "jQuery",
            desc: "the write less, do more, JavaScript library"
        },
        {
            label: "jQuery UI",
            desc: "the official user interface library for jQuery"
        },
        {
            label: "Sizzle JS",
            desc: "a pure-JavaScript CSS selector engine"
        }
    ];

    var autoComplete = new Kamil('#tags', {
        source: tags
    });

    autoComplete.renderItem = function (ul, item) {
        var li = document.createElement('li');
        li.innerHTML = "<a>" + item.label + "<br><small>" + item.desc + "</small></a>";
        ul.appendChild(li);

        return li;
    };

    autoComplete.on('kamilfocus', function (e) {
        e.inputElement.value = e.item.label;
    });

    autoComplete.on('kamilselect', function (e) {
        e.inputElement.value = e.item.label.toLowerCase();
    });
};*/