/****************************************************************************
*****************************************************************************
*****************************************************************************
{
Summary: Pro.Document.JS - An extension of the Pro.JS library that offers a
high-level API for working with the DOM and selecting HTML elements on the page.
It makes cross-browser compatibility a non-issue and traversing the DOM easier than
ever because of the utilization of the pro.Collections.JS library for quickly
filtering through DOM elements.
Author: Jacob Heater,
Dependencies: Pro.JS & pro.Collections.JS,
Questions/Comments: jacobheater@gmail.com
}
****************************************************************************
*****************************************************************************
*****************************************************************************/
(function(pro, global, document, undefined) {
  //Private objects
  var regex = {
    attr: /([A-Za-z0-9]+=("|')[A-Za-z0-9!@#$%^&*()+=<>,.:;'\[\]\{\}\\\/ _-]{0,}("|'))/gi,
    elemName: /<(\s{0,})[A-Za-z0-9]+/gi,
    html: /(<[A-Za-z0-9]+>|[\w\W\s\S]+)[\w\W\s\S]+(<\/[A-Za-z0-9]+>|[\w\W\s\S]+)/gmi,
    selectors: {
      attr: /((\[[A-Za-z0-9_-]+\])|(\[[A-Za-z0-9_-]+=[A-Za-z0-9"'!@#$%^&*()+=\[\]\{\}:;"'<,>.\/?\\\|_-]+\]))/gi,
      name: /[A-Za-z]{1}/,
      noSpecialChars: /[^\<\>!@#$%^&*()+=.,\/\[\]\{\}_-]/
    }
  };
  var getHtmlArray = function(str) {
    var html = new pro.collections.list();
    if (pro.isString(str)) {
      var matches = str.match(regex.html);
      matches = pro.collections.asEnumerable(matches);
      if (matches.count() === 1) {
        str = str.replace(/[<]+/g, '\r\n<').replace(/[>]+/g, '>\r\n');
        matches = pro.collections.asEnumerable(str.match(regex.html)).select(function(m) {
          return m.trim();
        });
      }
      if (matches.count() > 0) {
        matches.forEach(function(i, m) {
          var htmlArr = pro.collections.asEnumerable(m.split(/[\r\n]+/)).select(function(s) {
            return s.trim();
          });
          htmlArr.forEach(function(i, m) {
            html.add(m);
          });
        });
      }
    }
    return html.toArray();
  };
  var parseHtml = function(str, ignoreSelf) {
    var builder = new pro.stringBuilder();
    var ignore = pro.isBoolean(ignoreSelf) ? ignoreSelf : false;
    var htmlArr = getHtmlArray(str);
    if (htmlArr.length > 0) {
      if (ignore === true) {
        htmlArr.splice(0, 1);
        htmlArr.splice(htmlArr.length - 1, 1);
      }
      htmlArr.forEach(function(m) {
        builder.append(m);
      });
    }
    return builder.toString();
  };
  var getStyleObj = function(str) {
    var obj = {};
    if (pro.isString(str)) {
      var styles = pro.collections.asEnumerable(str.split(';')).where(function(s) {
        return s !== ""
      });
      styles.forEach(function(s) {
        var kvp = s.split(':');
        var key = kvp[0];
        var value = kvp[1].replace(/[;]+/g, '');
        obj[key] = value;
      });
    }
    return obj;
  };
  var getExoElementHtml = function(element) {
    var html = "";
    if (pro.isClass(element) && element.is(pro.document.queryResult)) {
      html = element.select(function(e) {
        return pro.document.query(e).first().outerHTML;
      }).stringify('');
    }
    return html;
  };
  /*@ Purpose: Exposes an API for DOM related functionality.
  @ Namespace: pro.document */
  pro.module('document', pro.object({
    extend: pro.extend,
    /*@ Purpose: Tracks the state of the Document Object Model and allows for an event handler to be fired when the DOM is loaded.
    @ Param: readyHandler -> function: The handler to be fired when the DOM is loaded.
    @ Returns: void.*/
    ready: function(readyHandler) {
      var isReadyHandlerValid = pro.isFunction(readyHandler);
      if (document.onreadystatechange) {
        document.onreadystatechange = function(e) {
          switch (document.readyState) {
            case 'loading':
              break;
            case 'interactive':
              if (isReadyHandlerValid) {
                readyHandler.call(pro.document, document, e);
              }
              break;
            case 'complete':
              break;
            default:
              break;
          }
        };
      } else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', function(e) {
          if (isReadyHandlerValid) {
            readyHandler.call(pro.document, document, e);
          }
        });
      } else {
        global.onload = function(e) {
          if (isReadyHandlerValid) {
            readyHandler.call(pro.document, document, e);
          }
        };
      }
    },
    queryResult: pro.$class('pro.document.queryResult', function(array, context) {
      array = pro.collections.asEnumerable(array).distinct().toArray();
      this.initializeBase(array, {
        output: function(e) {
          return new pro.document.queryResult(e.toArray());
        },
        where: {
          cast: function(e) {
            var qr = pro.document.query(e);
            return qr;
          }
        },
        select: {
          cast: function(e) {
            var qr = pro.document.query(e);
            return qr;
          },
          output: function(e) {
            return e;
          }
        }
      });
      var $this = this;
      $this.length = this.count();
      $this.context = context || document;
      pro.$for(array, function(i, o) {
        $this[i] = o;
      });
      return $this;
    }, pro.collections.enumerable),
    query: function(selector, context) {
      var ctxt = context || document;
      if (ctxt) {
        if (pro.isObject(selector) && selector instanceof Element) {
          return new pro.document.queryResult([selector], ctxt);
        } else if (selector === document) {
          return pro.document.extend({
            native: document
          });
        } else if (selector === global) {
          return pro.window.extend({
            native: global
          });
        }
        var result = [];
        var c0;
        var trunc;
        if (ctxt.querySelectorAll) {
          result = pro.collections.array.merge(result, ctxt.querySelectorAll(selector));
        } else {
          var processResult = function(selector) {
            c0 = selector.charAt(0);
            trunc = selector.substring(1, selector.length);
            switch (c0) {
              case '#':
                var right = ctxt !== document ? new pro.document.queryResult([ctxt], ctxt).children().where(function(e) {
                  return e.attr('id') === trunc;
                }) : ctxt.getElementById(trunc);
                result = pro.collections.array.merge(result, right);
                break;
              case '.':
                var right = ctxt !== document ? new pro.document.queryResult([ctxt], ctxt).children().where(function(e) {
                  return e.hasClass(trunc);
                }) : ctxt.getElementsByClassName(trunc);
                result = pro.collections.array.merge(result, right);
                break;
              case '[':
                if (selector.match(regex.selectors.attr).length > 0) {
                  var attr = selector;
                  attr = attr.substring(1, attr.length);
                  attr = attr.substring(0, attr.length - 1);
                  var attrName = attr.indexOf('=') > -1 ? attr.split('=')[0] : attr;
                  var attrValue = attr.indexOf('=') > -1 ? attr.split('=')[1] : null;
                  if (attrValue !== null) {
                    attrValue = pro.parseJson(attrValue);
                    var children = ctxt === document ? document.body.children : ctxt.children;
                    result = pro.collections.array.merge(result, new pro.document.queryResult(children).where(function(e) {
                      return e.hasAttr(attrName) && e.attr(attrName) === attrValue;
                    }).toArray());
                  } else {
                    result = pro.collections.array.merge(result, new pro.document.queryResult(children).where(function(e) {
                      return e.hasAttr(attrName);
                    }));
                  }
                }
                break;
              default:
                if (regex.selectors.name.test(c0) && regex.selectors.noSpecialChars.test(selector)) {
                  var right = ctxt !== document ? new pro.document.queryResult([ctxt], ctxt).children().where(function(e) {
                    return e.attr('tagName').toLowerCase() === selector.toLowerCase();
                  }) : ctxt.getElementsByTagName(selector);
                  result = pro.collections.array.merge(result, document.getElementsByTagName(selector));
                }
                break;
            }
          };
          if (selector.indexOf(',') > -1) {
            var selectors = pro.collections.asEnumerable(selector.split(',')).where(function(s) {
              return s !== "";
            }).select(function(s) {
              return s.trim();
            });
            selectors.forEach(function(i, s) {
              processResult(s);
            });
          } else {
            processResult(selector);
          }
        }
        return new pro.document.queryResult(result, ctxt);
      } else {
        throw new Error("No document object found!");
      }
    },
    create: function(contents) {
      if (pro.isString(contents)) {
        var innerHtml = parseHtml(contents, true);
        var htmlArr = getHtmlArray(contents);
        var container = htmlArr[0] || "";
        var attributes = container.match(regex.attr) || [];
        var tagName = container.match(regex.elemName) || "";
        if (tagName.length > 0 && tagName !== "") {
          tagName = tagName[0].replace('<', '').trim();
          var element = document.createElement(tagName);
          var exoElement = pro.document.query(element);
          if (attributes.length > 0) {
            attributes = pro.collections.asEnumerable(attributes).select(function(kvp) {
              var split = kvp.split('=');
              var key = split[0];
              var value = pro.parseJson(split[1]);
              return new pro.keyValuePair(key, pro.parseJson(value));
            }).toDictionary();
            exoElement.attr(attributes);
          }
          if (innerHtml !== "" && innerHtml.length > 0) {
            exoElement.html(innerHtml);
          }
          return exoElement;
        }
        throw new Error("Invalid html provided for element to create.");
      }
      return this;
    }
  }));
  /*@ Purpose: Provides an API for window related functions.
  @ Namespace: pro.window*/
  pro.module('window', pro.object({
    extend: pro.extend,
    queryString: {
      get: function(key) {
        var keyValuePairs = pro.window.queryString.keyValuePairs();
        value = null;
        if (keyValuePairs.count() > 0) {
          var query = keyValuePairs.where(function(kvp) {
            var split = kvp.split('='),
              _key = split[0],
              _value = split[1];
            return _key === key;
          }).select(function(kvp) {
            var split = kvp.split('='),
              _key = split[0],
              _value = split[1];
            return global.unescape(_value);
          });
          if (query.count() > 0) {
            value = query.first();
          }
        }
        return value;
      },
      keyValuePairs: function() {
        var location = global.location,
          search = location.search,
          queryString = search.replace('?', pro.emptyString),
          keyValuePairs = queryString.split('&'),
          enumerable = pro.collections.asEnumerable(keyValuePairs);
        enumerable.toQueryString = function() {
          return pro.stringFormatter('?{0}', this.toArray().join('&'));
        };
        enumerable.setQueryString = function(key, value) {
          var output = this.select(function(kvp, i) {
            var split = kvp.split('=');
            if (split.length > 0) {
              var _key = split[0];
              var _value = split[1];
              if (_key === key) {
                _value = value;
                return pro.stringFormatter('{0}={1}', _key, _value);
              }
            }
            return kvp;
          });
          output.toQueryString = enumerable.toQueryString;
          output.setQueryString = enumerable.setQueryString;
          return output;
        };
        return enumerable;
      }
    }
  }));
  pro.extend(pro.object({
    /*@ Purpose: A $class constructor that initializes a new instance of a native XMLHttpRequest object that abstracts much of the functionality into a high-level API.
    @ Param: configuration -> object: A plain object that contains parameters for configuration of the XMLHttPRequeset.
    @ Returns: Object -> The initialized instance of the pro.AjaxRequest object.*/
    AjaxRequest: pro.$class('pro.AjaxRequest', function(configuration) {
      var xhr = new XMLHttpRequest();
      var promise = new pro.promise();
      var $ajaxRequest = this;
      var isInFaultedState = false;
      var mime = pro.object({
        json: 'application/json;'
      });
      //Configurable instance members.
      this.url = pro.emptyString;
      this.method = "GET";
      this.cache = false;
      this.data = pro.toJson({});
      this.headers = new pro.collections.dictionary();
      this.userName = pro.emptyString;
      this.password = pro.emptyString;
      this.authenticate = false;
      this.parseData = false;
      pro.extend(this, configuration);
      //Non-configurable instance members.
      this.status = 0;
      this.response = null;
      this.cancel = function() {
        xhr.abort();
      };
      this.promise = function() {
        return promise;
      };
      if (pro.isNumber(this.timeout)) {
        xhr.timeout = this.timeout;
      }
      if (this.cache === false) {
        this.url += pro.string.contains(this.url, '?') ? pro.stringFormatter('&_={0}', pro.math.random(1, 1000)) : pro.stringFormatter('?_={0}', pro.math.random(1, 1000));
      }
      //Configure the XMLHttpRequest object
      xhr.onreadystatechange = function(event) {
        switch (xhr.readyState) {
          case 0: //Unsent
            break;
          case 1: //Opened
            break;
          case 2: //Headers Received
            break;
          case 3: //Loading
            if (xhr.status !== 200) { //Indicates that the server returned a response that wasn't successful
              isInFaultedState = true;
            }
            var responseContentType = this.getResponseHeader('content-type');
            var isJson = responseContentType !== null && pro.string.contains(responseContentType, mime.json);
            $ajaxRequest.response = $ajaxRequest.parseData === true && isJson ? pro.parseJson(this.response) : this.response;
            $ajaxRequest.status = xhr.status;
            break;
          case 4: //Complete
            //Begin invoking the promise callstack.
            promise.beginCallstackInvocation($ajaxRequest.response, $ajaxRequest);
            break;
          default:
            break;
        }
      };
      //Set the XMLHttpRequest error  handler. This will be handled by the promise error handler if set, or swallowed.
      xhr.onerror = function(event) {
        throw new Error(event.toString());
      };
      xhr.ontimeout = function(event) {
        //Any errors will be handled by the promise error handler if set. Errors will break the runtime unless error handler in the promise throws there.
        throw new Error(pro.stringFormatter("XmlHttpRequest timed out at: {0}", event.timeStamp.toString()));
      };
      //Send the XMLHttpRequest to the destination server.
      this.send = function() {
        //If the user has chosen to authenticate the request, send the credentials, otherwise do not.
        if (this.authenticate === false) {
          xhr.open(this.method, this.url, true);
        } else {
          xhr.withCredentials = true;
          xhr.open(this.method, this.url, true, this.userName, this.password);
        }
        //Set content type request header, if applicable
        if (this.contentType) {
          this.headers.add('content-type', this.contentType);
        }
        //Set HTTP Request Headers
        this.headers.forEach(function(i, kvp) {
          xhr.setRequestHeader(kvp.key, kvp.value);
        });
        xhr.send(this.data);
        return this;
      };
    }),
    /*@ Purpose: Exposes an asynchronous mecahnism of communication over HTTP with a highly asbtracted API of the native XMLHttPRequest object.
    @ Param: configuration -> object: A plain object that contains parameters for configuration of the XMLHttPRequeset.
    @ Returns: pro.promise -> The promise that is used to manage callbacks during the lifecycle of the XMLHttpRequest.*/
    ajax: function(configuration) {
      var xhr = new pro.AjaxRequest(configuration).send();
      return {
        success: function(action) {
          xhr.promise().deferAction(action);
          return this;
        },
        error: function(handler) {
          xhr.promise().setErrorHandler(handler);
          return this;
        },
        complete: function(action) {
          xhr.promise().pushToCallstack(action).finalize();
          return this;
        },
        addHeader: function(name, value) {
          xhr.headers.add(name, value);
          return thsi;
        }
      };
    }
  }));
  /************************************************************************
  ************************************************************************
  pro.document.queryResult.prototype extensions for additional DOM manipulation features.
  Other DOM related components for pro.document module.
  ************************************************************************
  ************************************************************************/
  var queryResult = function(collection) {
    return new pro.document.queryResult(pro.isArray(collection) || pro.isReadOnlyArray(collection) ? collection : [collection]);
  };
  var domEvent = pro.$class('pro.document.DOMEvent', function(name, handler) {
    this.name = name;
    this.handler = handler;
    this.id = pro.GUID.create();
    this.key = pro.stringFormatter('{0}|{1}', this.name, this.id);
    this.timestamp = new Date();
  });
  //Extend the pro.document.queryResult class.
  pro.document.queryResult.extend(pro.object({
    on: function(event, handler) {
      var exoElem = this;
      if (pro.isString(event) && event.trim() !== "" && pro.isFunction(handler)) {
        event = event.trim();
        var prefix = event.substring(0, 2);
        if (prefix !== "on") {
          event = "on" + event;
        }
        var _event = new domEvent(event, handler);
        this.forEach(function(i, e) {
          if (!e.proEventCache || !(e.proEventCache && pro.isClass(e.proEventCache) && e.proEventCache.is(pro.collections.dictionary))) {
            e.proEventCache = new pro.collections.dictionary();
          }
          e.proEventCache.add(_event.key, _event);
          if (!e[_event.name]) {
            e[_event.name] = function(eventArgs) {
              var domElem = this;
              this.proEventCache.forEach(function(i, de) {
                de.value.handler.call(domElem, eventArgs, domElem, query(domElem));
              });
            };
          }
        });
      }
      return this;
    },
    off: function(event, id) {
      var exoElem = this;
      if (pro.isString(event) && event !== "") {
        event = event.trim();
        var prefix = event.substring(0, 2);
        if (prefix !== "on") {
          event = "on" + event;
        }
        this.forEach(function(i, e) {
          if (e.proEventCache && pro.isClass(e.proEventCache) && e.proEventCache.is(pro.collections.dictionary)) {
            if (pro.isString(id) && id.trim() !== "") {
              id = id.trim();
              e.proEventCache.remove(pro.stringFormatter("{0}|{1}", event, id));
            } else {
              var matches = e.proEventCache.where(function(_event_) {
                return _event_.key.split("|")[0] === event;
              });
              if (matches.count() > 0) {
                matches.forEach(function(i, kvp) {
                  e.proEventCache.remove(kvp.key);
                });
              }
            }
          }
        });
      } else {
        this.forEach(function(i, e) {
          e.proEventCache.clear();
        });
      }
      return this;
    },
    html: function(html) {
      var _html = null;
      if (html) {
        if (pro.isObject(html)) {
          if (pro.isClass(html)) {
            _html = html.html();
          } else {
            _html = html.innerHTML;
          }
        } else if (pro.isString(html)) {
          _html = html;
        }
        if (_html) {
          this.forEach(function(i, o) {
            o.innerHTML = _html;
          });
        }
      } else {
        return this.first() !== undefined ? this.first().innerHTML : "";
      }
      return this;
    },
    text: function(text, appendPrepend) {
      var _text = null;
      if (text) {
        if (pro.isObject(text)) {
          if (pro.isClass(text)) {
            _text = text.text();
          } else {
            _text = text.innerText;
          }
        } else if (pro.isString(text)) {
          _text = text;
        }
        if (_text) {
          this.forEach(function(i, o) {
            o.innerText = appendPrepend === 1 ? o.innerText + _text : appendPrepend === 2 ? _text + o.innerText : text;
          });
        }
      } else {
        return this.first() !== undefined ? this.first().innerText : "";
      }
      return this;
    },
    value: function(value) {
      if (pro.isUndefined(value)) {
        return this.first().value || "";
      }
      return this.forEach(function(i, o) {
        if (pro.isDefined(o.value)) {
          o.value = value.toString();
        }
      });
    },
    append: function(element) {
      if (pro.isObject(element)) {
        if (pro.isClass(element) && element.is(pro.document.queryResult)) {
          this.forEach(function(i, e) {
            element.forEach(function(i, ee) {
              e.appendChild(ee);
            });
          });
        } else {
          this.forEach(function(i, e) {
            e.appendChild(element);
          });
        }
      }
      return this;
    },
    prepend: function(element) {
      if (pro.isObject(element)) {
        if (pro.isClass(element) && element.is(pro.document.queryResult)) {
          this.forEach(function(i, e) {
            element.reverse().forEach(function(i, ee) {
              var parent = e.parentElement;
              if (parent) {
                var tag = query(parent).attr('tagName').toLowerCase();
                if (tag === 'html' || tag === 'body') {
                  parent = query('body').first();
                }
                parent.insertBefore(ee, parent.children[0]);
              }
            });
          });
        } else {
          this.reverse().forEach(function(i, e) {
            var parent = e.parentElement;
            if (parent) {
              var tag = query(parent).attr('tagName').toLowerCase();
              if (tag === 'html' || tag === 'body') {
                parent = query('body').first();
              }
              parent.insertBefore(element, parent.children[0]);
            }
          });
        }
      }
      return this;
    },
    appendTo: function(target) {
      if (pro.isObject(target)) {
        if (pro.isClass(target) && target.is(pro.document.queryResult)) {
          target.append(this);
        } else {
          var exoElement = pro.document.query(target);
          if (exoElement.length > 0) {
            exoElement.append(this);
          }
        }
      }
      return this;
    },
    prependTo: function(target) {
      if (pro.isObject(target)) {
        if (pro.isClass(target) && target.is(pro.document.queryResult)) {
          target.prepend(this);
        } else {
          var exoElement = pro.document.query(target);
          if (exoElement.length > 0) {
            exoElement.prepend(this);
          }
        }
      }
      return this;
    },
    attr: function(key, value) {
      var $this = this;
      if (arguments.length === 1 && pro.isClass(key) && key.is(pro.collections.dictionary)) {
        key.forEach(function(i, kvp) {
          var key = kvp.key;
          var value = kvp.value;
          $this.attr(key, value);
        });
      } else if (arguments.length === 1 && pro.isObject(key)) {
        pro.enumerateObject(key, function(k, v) {
          $this.attr(k, v);
        });
      } else if (arguments.length === 2 && pro.isString(key) && pro.isString(value)) {
        this.forEach(function(i, o) {
          switch (key.toLowerCase()) {
            case 'class':
              $this.addClass(value);
              break;
            case 'id':
              o.id = value;
              break;
            case 'type':
              o.type = value;
              break;
            case 'style':
              var styleObj = getStyleObj(value);
              $this.style(styleObj);
            default:
              o.attributes[key] = value;
              break;
          }
        });
      } else if (arguments.length === 1 && pro.isString(key)) { //Need to retrieve attribute value
        if (this.first() !== undefined) {
          var val = this.first()[key];
          if (val === undefined || val === "") {
            val = this.first().attributes[key];
            if (val) {
              val = val.value;
            }
          }
          return val || "";
        }
        return "";
      }
      return this;
    },
    hasAttr: function(name) {
      return this.attr(name) !== "";
    },
    dispose: function() {
      this.forEach(function(i, e) {
        e.remove();
      });
      return this;
    },
    classList: function() {
      if (arguments.length === 0) {
        return pro.collections.asEnumerable(this.first() !== undefined ? (this.first().className.split(' ').length > 0 ? this.first().className.split(' ') : []) : []).where(function(n) {
          return n !== "" && n.length > 0;
        }).toList();
      } else if (arguments.length === 1 && pro.isArray(arguments[0]) || pro.isEnumerable(arguments[0])) {
        var c = pro.collections.asEnumerable(arguments[0]);
        this.forEach(function(i, o) {
          o.className = queryResult(o).classList().clear().addRange(c).distinct().join(' ');
        });
      } else if (arguments.length >= 1) {
        var c = pro.collections.asEnumerable(Array.apply(this, arguments));
        this.forEach(function(i, o) {
          o.className = queryResult(o).classList().clear().addRange(c).distinct().join(' ');
        });
      }
      return this;
    },
    addClass: function(name) {
      return this.classList(this.classList().addRange(arguments));
    },
    removeClass: function(name) {
      return this.classList(this.classList().removeRange(arguments));
    },
    hasClass: function(name) {
      return this.first() !== undefined ? this.first().classList.contains(name) : false;
    },
    children: function() {
      return this.first() !== undefined ? queryResult(this.first().children) : queryResult([]);
    },
    at: function(index) {
      return queryResult([this.atIndex(index)]);
    },
    style: function(name, value) {
      if (pro.isString(name) && pro.isString(value)) {
        var $this = this;
        this.forEach(function(i, o) {
          o.style[name] = value;
        });
      } else if (pro.isObject(name)) {
        pro.enumerateObject(name, function(k, v) {
          $this.forEach(function(i, o) {
            o.style[k] = v;
          });
        });
      } else if (pro.isString(name) && pro.isUndefined(value)) {
        return this.first().style[name];
      }
      return this;
    },
    find: function(selector) {
      return pro.document.query(selector, this.first());
    },
    /*****************************************************************************
    ******************************************************************************
    Event listeners
    ******************************************************************************
    ******************************************************************************/
    clik: function(handler) {
      return this.on('clik', handler);
    },
    hover: function(handler) {
      return this.on('hover', handler);
    },
    mouseup: function(handler) {
      return this.on('mouseup', handler);
    },
    mousedown: function(handler) {
      return this.on('mousedown', handler);
    },
    keyup: function(handler) {
      return this.on('keyup', handler);
    },
    keydown: function(handler) {
      return this.on('keydown', handler);
    },
    keypress: function(handler) {
      return this.on('keypress', handler);
    },
    mouseenter: function(handler) {
      return this.on('mouseenter', handler);
    },
    mouseleave: function(handler) {
      return this.on('mouseleave', handler);
    }
  }));
  //Global assignments
  global.query = global.eq = pro.document.query;
  global.ready = pro.document.ready;
})(pro, window, document, undefined);
