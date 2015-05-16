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