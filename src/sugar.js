/**
 * This is just a modern browser for operation on a simplified DOM syntactic sugar script
 *
 * @namespace SugarJs
 * @auhor Amery
 * @version v0.5.1
 */

;(function (window, document, undifined) {
    'use strict';

    var Sugar, sugar, query, fragment, ready,
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        table = document.createElement('table'),
        tableRow = document.createElement('tr'),
        specialTags = {
            'tr': document.createElement('tbody'),
            'tbody': table, 'thead': table, 'tfoot': table,
            'td': tableRow, 'th': tableRow,
            '*': document.createElement('div')
        },
        emptyArray = [],
        arrayProp = Array.prototype;

    query = function query(selector, context) {
        context = context || document;

        if (/^[\#.]?[\w-]+$/.test(selector)) {
            if (selector[0] === '.') {
                return context.getElementsByClassName(selector.slice(1));
            } else if (selector[0] === '#') {
                var element = context.getElementById(selector.slice(1));
                return element ? [element] : [];
            } else {
                return context.getElementsByTagName(selector);
            }
        }
        return context.querySelectorAll(selector);
    };

    fragment = function fragment(html) {
        var tagName = html.match(fragmentRE)[1],
            container, dom;

        if (singleTagRE.test(html)) {
            return [document.createElement(tagName)];
        } else {
            if (!(tagName in specialTags)) {
                tagName = '*';
            }
            container = specialTags[tagName];
            container.innerHTML = '' + html;
            dom = arrayProp.slice.call(container.childNodes);
            container.innerHTML = '';
            return dom;
        }
    };

    ready = function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    };

    Sugar = function Sugar(query) {
        var len = query.length;

        this.length = len;
        while(len--) {
            this[len] = query.length;
        }
    };

    Sugar.prototype = {

    };

    sugar = function sugar(selector, context) {
        if (!selector) {
            return new Sugar(emptyArray);
        }

        if (context) {
            if (typeof context === 'string') {
                return new Sugar(query(selector, context));
            } else {
                context = context instanceof Sugar ? context : new Sugar(context);
                return context.find(selector);
            }
        }

        if (typeof selector === 'string') {
            selector = selector.trim();
            if (selector[0] === '<' && fragmentRE.test(selector)) {
                return new Sugar(fragment(selector));
            } else {
                return new Sugar(query(selector));
            }
        } else if (selector instanceof Sugar) {
            return selector;
        } else if (typeof selector === 'function') {
            return ready(selector);
        } else if (arrayProp.isArray(selector)) {
            return new Sugar(selector);
        } else {
            return new Sugar([selector]);
        }
    };
}(window, document));
