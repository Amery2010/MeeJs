/**
 * 这只是一个面向现代浏览器关于简化 DOM 操作的一份语法糖工具库
 *
 * @namespace MeeJs
 * @auhor Amery
 * @version v0.5.1
 */

;(function (window, document, undefined) {
    'use strict';

    var Mee, mee, query, fragment, camelize, dasherize, maybeAddPx,
        ready, filtered, expose, matches, iterate, getContent,
        getHeightOrWeight, getHeightOrWeightWithMargin,
        hasClass, addClass, removeClass, toggleClass,
        children, parent, prev, next, siblings,
        queryRE = /^[\#.]?[\w-]+$/,
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        rdisplayRE = /^(none|table(?!-c[ea]).+)/,
        capitalRE = /[A-Z]/g,
        div = document.createElement('div'),
        table = document.createElement('table'),
        tableRow = document.createElement('tr'),
        specialTags = {
            'tr': document.createElement('tbody'),
            'tbody': table, 'thead': table, 'tfoot': table,
            'td': tableRow, 'th': tableRow, '*': div
        },
        propMap = {
            'tabindex': 'tabIndex',
            'readonly': 'readOnly',
            'for': 'htmlFor',
            'class': 'className',
            'maxlength': 'maxLength',
            'cellspacing': 'cellSpacing',
            'cellpadding': 'cellPadding',
            'rowspan': 'rowSpan',
            'colspan': 'colSpan',
            'usemap': 'useMap',
            'frameborder': 'frameBorder',
            'contenteditable': 'contentEditable'
        },
        cssNumber = ['columnCount', 'columns', 'fontWeight', 'lineHeight', 'opacity', 'zIndex', 'zoom'],
        emptyArray = [];

    query = function query(selector, context) {
        context = context || document;

        if (queryRE.test(selector)) {
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
            dom = emptyArray.slice.call(container.childNodes);
            container.innerHTML = '';
            return dom;
        }
    };

    camelize = function camelize(str) {
        return str.replace(/-+(.)?/g, function (match, chr) {
            return chr ? chr.toUpperCase() : '';
        });
    };

    dasherize = function decamelize(str) {
        return capitalRE.test(str) ? str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : str;
    };

    maybeAddPx = function maybeAddPx(name, value) {
        return (typeof value === 'number' && cssNumber.indexOf(name) === -1) ? value + 'px' : value;
    };

    ready = function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    };

    iterate = function iterate(obj, callback, scope) {
        var key;
        for (key in obj) {
            callback.call(scope, obj[key], key, obj);
        }
    };

    filtered = function filtered(collection, handle) {
        var elems = [];
        collection.each(function (elem) {
            emptyArray.forEach.call(handle.call(collection, elem), function (el) {
                if (elems.indexOf(el) === -1 && el !== null) {
                    elems.push(el);
                }
            });
        });
        return new Mee(elems);
    };

    getHeightOrWeight = function getHeightOrWeight(elem, type) {
        var style = window.getComputedStyle(elem, null);
        if (type === 'Height') {
            return elem.clientHeight - parseFloat(style.paddingTop, 10) - parseFloat(style.paddingBottom, 10);
        } else {
            return elem.clientWeight - parseFloat(style.paddingLeft, 10) - parseFloat(style.paddingRight, 10);
        }
    };

    getHeightOrWeightWithMargin = function getHeightOrWeightWithMargin(elem, type) {
        var style = window.getComputedStyle(elem, null);
        if (type === 'Height') {
            return elem.offsetHeight + parseFloat(style.marginTop, 10) + parseFloat(style.marginBottom, 10);
        } else {
            return elem.offsetWeight + parseFloat(style.marginLeft, 10) + parseFloat(style.marginRight, 10);
        }
    };

    expose = function expose(elem, type, callback) {
        var value;
        if (rdisplayRE.test(elem.style.display) && elem['offset' + type] === 0) {
            var before = elem.style.cssText;
            elem.style.display = 'block';
            elem.style.position = 'absolute';
            elem.style.visibility = 'hidden';
            value = callback(elem, type);
            elem.style.cssText = before;
            return value;
        } else {
            return callback(elem, type);
        }
    };

    getContent = function getContent(content) {
        if (content instanceof Mee) {
            content = content[0];
        } else if (typeof content === 'string') {
            content = fragment(content);
        }
        return content;
    };

    matches = (function () {
        var matchesSelector = div.matches || div.matchesSelector ||
                div.webkitMatchesSelector || div.mozMatchesSelector || div.msMatchesSelector;

        return function (elem, selector) {
            return matchesSelector.call(elem, selector);
        };
    }());

    hasClass = (function () {
        if ('classList' in div) {
            return function (elem, className) {
                return elem.classList.contains(className);
            };
        } else {
            return function (elem, className) {
                return new RegExp('(^| )' + className + '( |$)', 'gi').test(elem.className);
            };
        }
    }());

    addClass = (function () {
        if ('classList' in div) {
            return function (elem, className) {
                elem.classList.add(className);
            };
        } else {
            return function (elem, className) {
                if (!hasClass(elem, className)) {
                    elem.className += ' ' + className;
                }
            };
        }
    }());

    removeClass = (function () {
        if ('classList' in div) {
            return function (elem, className) {
                elem.classList.remove(className);
            };
        } else {
            return function (elem, className) {
                elem.className = elem.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            };
        }
    }());

    toggleClass = (function () {
        if ('classList' in div) {
            return function (elem, className) {
                elem.classList.toggle(className);
            };
        } else {
            return function (elem, className) {
                var classes = elem.className.split(' '),
                    existingIndex = classes.indexOf(className);

                if (existingIndex === -1) {
                    classes.push(className);
                } else {
                    classes.splice(existingIndex, 1);
                }

                elem.className = classes.join(' ');
            };
        }
    }());

    children = (function () {
        if ('children' in div) {
            return function (elem) {
                return elem.children;
            };
        } else {
            return function (elem) {
                return elem.childNodes;
            };
        }
    }());

    parent = (function () {
        if ('parentElement' in div) {
            return function (elem) {
                return elem.parentElement;
            };
        } else {
            return function (elem) {
                return elem.parentNode;
            };
        }
    }());

    prev = (function () {
        if ('previousElementSibling' in div) {
            return function (elem) {
                return elem.previousElementSibling;
            };
        } else {
            return function (elem) {
                return elem.previousSibling;
            };
        }
    }());

    next = (function () {
        if ('nextElementSibling' in div) {
            return function (elem) {
                return elem.nextElementSibling;
            };
        } else {
            return function (elem) {
                return elem.nextSibling;
            };
        }
    }());

    siblings = (function () {
        if ('parentElement' in div && 'children' in div) {
            return function (elem) {
                return emptyArray.filter.call(elem.parentElement.children, function (el) {
                    return el !== elem;
                });
            };
        } else {
            return function (elem) {
                return emptyArray.filter.call(elem.parentNode.childNodes, function (el) {
                    return el !== elem;
                });
            };
        }
    }());

    Mee = function Mee(query) {
        var len = query.length;

        this.length = len;
        while (len--) {
            this[len] = query[len];
        }
    };

    Mee.prototype = {
        forEach: emptyArray.forEach,
        reduce: emptyArray.reduce,
        push: emptyArray.push,
        sort: emptyArray.sort,
        indexOf: emptyArray.indexOf,
        concat: emptyArray.concat,
        splice: emptyArray.splice,
        slice: function () {
            return new Mee(emptyArray.slice.apply(this, arguments));
        },
        get: function (idx) {
            if (idx === undefined) {
                return emptyArray.slice.call(this);
            } else {
                return this[idx >= 0 ? idx : idx + this.length];
            }
        },
        eq: function (idx) {
            return this.slice(idx, idx +1);
        },
        size: function () {
            return this.length;
        },
        each: function (callback) {
            var i, len = this.length;
            for (i = 0; i < len; i++) {
                callback.call(this, this[i], i, this);
            }
            return this;
        },
        map: function (callback) {
            var i, len = this.length;
            for (i = 0; i < len; i++) {
                this[i] = callback.call(this, this[i], i, this);
            }
            return this;
        },
        add: function (selector, context) {
            return filtered(this, function () {
                return this.concat(query(selector, context));
            }.bind(this));
        },
        is: function (selector) {
            var len = this.length;
            while (len--) {
                if (matches(this[len], selector)) {
                    return true;
                }
            }
            return false;
        },
        not: function (selector) {
            return this.is(selector) ? false : true;
        },
        filter: function (selector) {
            if (selector !== undefined) {
                return new Mee(emptyArray.filter.call(this,
                    typeof selector === 'function' ? selector : function (elem) {
                        return matches(elem, selector);
                    })
                );
            } else {
                return this;
            }
        },
        find: function (selector) {
            return filtered(this, function (elem) {
                return query(selector, elem);
            });
        },
        closest: function (selector, context) {
            if (this.length) {
                var elem = this[0];
                if (context) {
                    if (!(context instanceof Mee)) {
                        context = mee(context);
                    }
                } else {
                    context = null;
                }
                do {
                    elem = parent(elem);
                    if (elem === context || context.indexOf(elem) !== -1) {
                        return null;
                    }
                } while (!matches(elem, selector));
                return new Mee([elem]);
            } else {
                return null;
            }
        },
        hasClass: function (className) {
            var len = this.length;
            while (len--) {
                if (hasClass(this[len], className)) {
                    return true;
                }
            }
            return false;
        },
        addClass: function (className) {
            return this.each(function (elem) {
                addClass(elem, className);
            });
        },
        removeClass: function (className) {
            return this.each(function (elem) {
                removeClass(elem, className);
            });
        },
        toggleClass: function (className) {
            return this.each(function (elem) {
                toggleClass(elem, className);
            });
        },
        children: function (selector) {
            return filtered(this, function (elem) {
                return children(elem);
            }).filter(selector);
        },
        parent: function (selector) {
            return filtered(this, function (elem) {
                return parent(elem);
            }).filter(selector);
        },
        prev: function (selector) {
            return filtered(this, function (elem) {
                return prev(elem);
            }).filter(selector);
        },
        next: function (selector) {
            return filtered(this, function (elem) {
                return next(elem);
            }).filter(selector);
        },
        siblings: function (selector) {
            return filtered(this, function (elem) {
                return siblings(elem);
            }).filter(selector);
        },
        first: function () {
            return new Mee(this.length ? [this[0]] : []);
        },
        last: function () {
            return new Mee(this.length ? [this[this.length -1]] : []);
        },
        remove: function () {
            return this.each(function (elem) {
                elem.parentNode.removeChild(elem);
            });
        },
        empty: function () {
            return this.each(function (elem) {
                elem.innerHTML = '';
            });
        },
        html: function (html) {
            if (html === undefined) {
                return this.length ? this[0].innerHTML : undefined;
            } else {
                return this.each(function (elem) {
                    elem.innerHTML = html;
                });
            }
        },
        text: function (text) {
            if (text === undefined) {
                return this.length ? this[0].textContent : undefined;
            } else {
                return this.each(function (elem) {
                    elem.textContent = String(text);
                });
            }
        },
        attr: function (name, value) {
            if (value === undefined) {
                return this.length ? this[0].getAttribute(name) : undefined;
            } else {
                return this.each(function (elem) {
                    elem.setAttribute(name, value);
                });
            }
        },
        removeAttr: function (name) {
            return this.each(function (elem) {
                elem.removeAttribute(name);
            });
        },
        prop: function (name, value) {
            name = propMap[name] || name;

            if (value === undefined) {
                return this.length ? this[0][name] : undefined;
            } else {
                return this.each(function (elem) {
                    elem[name] = value;
                });
            }
        },
        removeProp: function (name) {
            return this.each(function (elem) {
                try {
                    elem[name] = undefined;
                } catch (ex) {}
            });
        },
        val: function (value) {
            if (value === undefined) {
                if (this.length) {
                    return null;
                } else {
                    if (this[0].multiple) {
                        var selected = [];
                        emptyArray.forEach.call(this[0].options, function (opt) {
                            if (opt.selected) {
                                selected.push(opt.value);
                            }
                        });
                        return selected;
                    } else {
                        return this[0].value;
                    }
                }
            } else {
                return this.each(function (elem) {
                    elem.value = value;
                });
            }
        },
        data: function (name, value) {
            if (value === undefined) {
                if (this.length) {
                    return this[0].dataset[name];
                } else {
                    return null;
                }
            } else {
                return this.each(function (elem) {
                    elem.dataset[name] = value;
                });
            }
        },
        css: function (name, value) {
            if (value === undefined) {
                if (!this.length) {
                    return null;
                }

                if (typeof name === 'string') {
                    name = camelize(name);
                    return this[0].style[name] || window.getComputedStyle(this[0], null).getPropertyValue(name);
                } else {
                    return this.each(function (elem) {
                        var currentStyle = elem.style.cssText.replace(/\s/g, '').split(';'),
                            stylesheet = {}, finalStyle = [], key;

                        currentStyle.forEach(function (style) {
                            var index = style.indexOf(':');
                            stylesheet[style.slice(0, index)] = style.slice(index +1, style.length);
                        });
                        for (key in name) {
                            stylesheet[dasherize(key)] = maybeAddPx(camelize(key), name[key]);
                        }
                        for (key in name) {
                            if (key && stylesheet[key]) {
                                finalStyle.push(key + ':' + stylesheet[key]);
                            }
                        }
                        elem.style.cssText = finalStyle.join(';');
                    });
                }
            } else {
                return this.each(function (elem) {
                    name = camelize(name);
                    elem.style[name] = maybeAddPx(name, value);
                });
            }
        },
        clone: function (deep) {
            deep = deep === false ? false : true;
            return this.map(function (elem) {
                return elem.cloneNode(deep);
            });
        },
        offset: function () {
            if (this.length) {
                var rect = this[0].getBoundingClientRect();
                return {
                    left: rect.left + document.body.scrollLeft,
                    top: rect.top + document.body.scrollTop
                };
            } else {
                return null;
            }
        },
        offsetParent: function () {
            return this.map(function (elem) {
                return elem.offsetParent || elem;
            });
        },
        scrollLeft: function (value) {
            if (value === undefined) {
                return this.length ? this[0].scrollLeft : null;
            } else {
                value = +value || 0;
                return this.each(function (elem) {
                    elem.scrollLeft = value;
                });
            }
        },
        scrollTop: function (value) {
            if (value === undefined) {
                return this.length ? this[0].scrollTop : null;
            } else {
                value = +value || 0;
                return this.each(function (elem) {
                    elem.scrollTop = value;
                });
            }
        },
        position: function () {
            return this.length ? {left: this[0].offsetLeft, top: this[0].offsetTop} : null;
        },
        replaceWith: function (content) {
            content = getContent(content);
            return this.map(function (elem) {
                elem.parentNode.replaceChild(content.cloneNode(true), elem);
            });
        },
        wrap: function (content) {
            content = getContent(content);
            return this.each(function (elem) {
                var newContent = content.cloneNode(true);
                newContent.appendChild(elem.parentNode.replaceChild(newContent, elem));
            });
        },
        wrapAll: function (content) {
            content = getContent(content);
            return this.each(function (elem, idx) {
                if (idx) {
                    content.appendChild(elem);
                } else {
                    content.appendChild(elem.parentNode.replaceChild(content, elem));
                }
            });
        },
        wrapInner: function (content) {
            content = getContent(content);
            return this.each(function (elem) {
                var newContent = content.cloneNode(true);
                emptyArray.forEach.call(elem.childNodes, function (node) {
                    newContent.appendChild(node);
                });
                elem.appendChild(newContent);
            });
        },
        unwrap: function () {
            return this.each(function (elem) {
                var docfrag = document.createDocumentFragment();
                emptyArray.forEach.call(elem.childNodes, function (node) {
                    docfrag.appendChild(node);
                });
                elem.parentNode.replaceChild(docfrag, elem);
            });
        }
    };

    iterate({Height: 'height', Weight: 'weight'}, function (type, dimension) {
        [type, 'inner' + dimension, 'outer' + dimension].forEach(function (mathod, idx) {
            Mee.prototype[mathod] = function (value) {
                if (value === undefined || value === true) {
                    if (this.length) {
                        var elem = this[0];
                        if (elem === window) {
                            return elem['inner' + dimension];
                        } else if (elem === document) {
                            return elem.documentElement['scroll' + dimension];
                        } else {
                            if (idx) {
                                if (idx === 1) {
                                    return expose(elem, type, function () {
                                        return elem['scroll' + dimension];
                                    });
                                } else {
                                    if (value === true) {
                                        return expose(elem, type, getHeightOrWeightWithMargin);
                                    } else {
                                        return expose(elem, type, function () {
                                            return elem['offset' + dimension];
                                        });
                                    }
                                }
                            } else {
                                return expose(elem, type, getHeightOrWeight);
                            }
                        }
                    } else {
                        return null;
                    }
                } else {
                    if (idx) {
                        value = parseFloat(value, 10);
                        if (idx === 1) {
                            return this.each(function (elem) {
                                elem['scroll' + dimension] = value;
                            });
                        } else {
                            return this.each(function (elem) {
                                elem['offset' + dimension] = value;
                            });
                        }
                    } else {
                        return this.each(function (elem) {
                            elem.style[mathod] = maybeAddPx(value);
                        });
                    }
                }
            };
        });
    });

    ['append', 'before', 'prepend', 'after'].forEach(function (mathod, idx) {
        var mathodMap = {append: 'beforeend', before: 'beforebegin', prepend: 'afterbegin', after: 'afterend'};

        Mee.prototype[mathod] = function (html) {
            if (typeof html === 'string') {
                return this.each(function (target) {
                    target.insertAdjacentHTML(mathodMap[mathod], html);
                });
            } else {
                return this.each(function (target) {
                    var parent = idx % 2 ? target.parentNode : target,
                        nodeList;

                    if (html instanceof Mee) {
                        nodeList = emptyArray.map.call(html, function (node) {
                            return node.cloneNode(true);
                        });
                    } else {
                        nodeList = [html.cloneNode(true)];
                    }

                    target = idx === 3 ? target.nextSibling :
                        idx === 2 ? target.firstChild :
                        idx === 1 ? target : null;

                    emptyArray.forEach.call(nodeList, function (node) {
                        parent.insertBefore(node, target);
                    });
                });
            }

        };

        Mee.prototype[idx % 2 ? 'insert' + (idx -1 ? 'Before' : 'After') : mathod + 'To'] = function (nodeList) {
            if (!(nodeList instanceof Mee)) {
                nodeList = new Mee(nodeList.length ? nodeList : [nodeList]);
            }

			nodeList[mathod](this);
            return this;
		};
    });

    mee = function mee(selector, context) {
        if (!selector) {
            return new Mee(emptyArray);
        }

        if (context) {
            if (typeof context === 'string') {
                return new Mee(query(selector, context));
            } else {
                context = context instanceof Mee ? context : new Mee(context);
                return context.find(selector);
            }
        }

        if (typeof selector === 'string') {
            selector = selector.trim();
            if (selector[0] === '<' && fragmentRE.test(selector)) {
                return new Mee(fragment(selector));
            } else {
                return new Mee(query(selector));
            }
        } else if (selector instanceof Mee) {
            return selector;
        } else if (typeof selector === 'function') {
            return ready(selector);
        } else if (emptyArray.isArray(selector)) {
            return new Mee(selector);
        } else {
            return new Mee([selector]);
        }
    };

    mee.fn = Mee.prototype;

    window.mee = mee;
    if (!window.$) {
        window.$ = mee;
    }
}(window, document));
