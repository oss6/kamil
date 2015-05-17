
var inputSelector = '#qunit-fixture > input';

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
    assert.deepEqual(Array.prototype.map.call(document.querySelector('.kamil-autocomplete').children, function (e) {
        return e.innerHTML;
    }), ['Java', 'JavaScript']);
});

QUnit.test('property', function (assert) {
    var ac = new Kamil(inputSelector, {
        source: [
            { label: 'JavaScript', value: 'js' },
            { label: 'Java', value: 'java-8' }
        ]
    });

    ac.start('j');
    console.log(document.querySelector('.kamil-autocomplete'));
    assert.deepEqual(Array.prototype.map.call(document.querySelector('.kamil-autocomplete').children, function (e) {
        return e.innerHTML;
    }), ['Java', 'JavaScript']);
});

QUnit.test('filter', function (assert) {

});

QUnit.test('sort', function (assert) {

});

QUnit.module('methods');
QUnit.test('close', function (assert) {

});

QUnit.test('destroy', function (assert) {

});

QUnit.test('disable', function (assert) {

});

QUnit.test('enable', function (assert) {

});

QUnit.test('isEnabled', function (assert) {

});

QUnit.test('option', function (assert) {

});

QUnit.test('start', function (assert) {

});

QUnit.module('extension points');
QUnit.test('renderItem', function (assert) {

});

QUnit.test('renderMenu', function (assert) {

});