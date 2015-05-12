/*!
 * Kamil v0.0.1
 * Autocomplete library - pure JS
 * http://oss6.github.io/kamil
 * MIT License
 * by Ossama Edbali
 */

(function (window, undefined) {

    var Kamil = window.Kamil = function (element, options) {

        var list = [];

        if (options.constructor === Array) {
            list = options;
        }
        else {
            list = options.source;
        }


    };

})(window);