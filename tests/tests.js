
var inputSelector = '#qunit-fixture > input',
    getListItemsContent = function () {
        return Array.prototype.map.call(document.querySelector('.kamil-autocomplete').children, function (e) {
            return e.innerHTML;
        });
    };

QUnit.module('options');
QUnit.test('source (array and selector)', function (assert) {
    var ac = new Kamil(inputSelector, {
        source: ['C', 'C++', 'Java', 'Haskell', 'COBOL']
    });

    assert.deepEqual(ac.option('source'), ['C', 'C++', 'Java', 'Haskell', 'COBOL']);

    ac = new Kamil(inputSelector, {
        source: '#qunit-fixture > ul.source'
    });
    assert.deepEqual(ac.source, ['C', 'C++', 'Java', 'Haskell', 'COBOL'])
});

QUnit.test('disabled', function (assert) {
    var ac = new Kamil('#qunit-fixture > input', {
        source: ['Java', 'JavaScript', 'Clojure'],
        disabled: true
    });

    ac.start('J');
    assert.equal(document.querySelector('.kamil-autocomplete').firstChild, null);
});

QUnit.test('autoFocus', function (assert) {
    var ac = new Kamil(inputSelector, {
        source: ['Java', 'JavaScript', 'Clojure'],
        autoFocus: true
    });

    ac.start('j');
    assert.equal('Java', document.querySelector('.kamil-active').innerHTML);
});

QUnit.test('minChars', function (assert) {
    var ac = new Kamil(inputSelector, {
        source: ['Java', 'JavaScript', 'Clojure'],
        minChars: 2
    });

    ac.start('j');
    assert.equal(document.querySelector('.kamil-autocomplete').firstChild, null);

    ac.start('ja');
    assert.deepEqual(getListItemsContent(), ['Java', 'JavaScript']);
});

QUnit.test('property', function (assert) {
    var ac = new Kamil(inputSelector, {
        source: [
            { label: 'JavaScript', value: 'js' },
            { label: 'Java', value: 'java-8' }
        ]
    });

    ac.start('j');
    assert.deepEqual(getListItemsContent(), ['Java', 'JavaScript']);

    ac = new Kamil(inputSelector, {
        source: [
            { name: 'Ossama', age: 19 },
            { name: 'Jake', age: 15 },
            { name: 'John', age: 34 },
            { name: 'Jack', age: 27 }
        ],
        property: 'name',
        sort: function (a, b) {
            return a.name.localeCompare(b.name);
        }
    });

    ac.start('j');
    assert.deepEqual(getListItemsContent(), ['Jack', 'Jake', 'John']);
});

QUnit.test('filter', function (assert) {
    var ac = new Kamil(inputSelector, {
        source: ['Java', 'JavaScript', 'Clojure'],
        // Match first letters
        filter: function (text, input) {
            var re = new RegExp('^' + input, 'i');
            return re.test(text);
        }
    });

    ac.start('j');
    assert.deepEqual(getListItemsContent(), ['Java', 'JavaScript']);
});

QUnit.test('sort', function (assert) {
    var ac = new Kamil(inputSelector, {
        source: ['Java', 'JavaScript', 'Clojure'],
        // Match first letters
        sort: function (a, b) {
            return a.localeCompare(b);
        }
    });

    ac.start('j');
    assert.deepEqual(getListItemsContent(), ['Clojure', 'Java', 'JavaScript']);
});

QUnit.module('methods');
QUnit.test('close', function (assert) {
    var ac = new Kamil(inputSelector, {
        source: ['Java', 'JavaScript', 'Clojure']
    });

    ac.start('j');
    var menu = document.querySelector('.kamil-autocomplete');
    assert.ok(menu.style.display === 'block', 'Menu should be visible');
    ac.close();
    assert.ok(menu.style.display === 'none', 'Menu should be closed');
});

QUnit.test('destroy', function (assert) {
    QUnit.expect(0);
});

QUnit.test('disable', function (assert) {
    var ac = new Kamil(inputSelector, {
        source: ['Java', 'JavaScript', 'Clojure']
    });

    ac.start('ja');
    assert.deepEqual(getListItemsContent(), ['Java', 'JavaScript']);

    // Keeps the previous items (menu not visible)
    ac.disable();
    ac.start('c');
    assert.deepEqual(getListItemsContent(), ['Java', 'JavaScript']);
    assert.ok(document.querySelector('.kamil-autocomplete').style.display === 'none', 'Menu should be closed');
});

QUnit.test('enable', function (assert) {
    var ac = new Kamil(inputSelector, {
        source: ['Java', 'JavaScript', 'Clojure'],
        disabled: true
    });

    ac.start('ja');
    assert.equal(document.querySelector('.kamil-autocomplete').firstChild, null);

    // Keeps the previous items (menu not visible)
    ac.enable();
    ac.start('ja');
    assert.deepEqual(getListItemsContent(), ['Java', 'JavaScript']);
});

QUnit.test('isEnabled', function (assert) {
    var ac = new Kamil(inputSelector, {
        source: '#qunit-fixture > ul.source'
    });

    assert.ok(ac.isEnabled(), 'Should be enabled');

    ac.disable();
    assert.ok(!ac.isEnabled(), 'Should be disabled');
});

QUnit.test('option', function (assert) {
    var ac = new Kamil(inputSelector, {
        source: ['Java', 'JavaScript', 'Clojure'],
        disabled: true
    });

    // Getter
    assert.deepEqual(ac.option('source'), ['Java', 'JavaScript', 'Clojure']);
    assert.ok(ac.option('disabled'), 'Disabled option (getter)');
    assert.equal(ac.option('minChars'), 1, 'minChars default value'); // Default
    assert.equal(ac.option('random'), undefined, 'Option does not exist');

    // Setter
    ac.option('disabled', false);
    assert.ok(!ac.option('disabled'), 'Disabled option (setter)');
});

QUnit.test('start', function (assert) {
    var ac = new Kamil(inputSelector, {
        source: ['Java', 'JavaScript', 'Clojure']
    });

    ac.start('ja');
    assert.deepEqual(getListItemsContent(), ['Java', 'JavaScript']);
    assert.ok(document.querySelector('.kamil-autocomplete').style.display === 'block', 'Menu should be visible');
});