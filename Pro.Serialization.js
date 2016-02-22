/****************************************************************************
 *****************************************************************************
 *****************************************************************************{
Summary: Pro.Serialization.JS - An extension of the Pro.JS library that offers
a high-level API for serialization/deserialization for JavaScript, as well as an API for converting
characters to their standardized representations.,
Author: Jacob Heater,
Dependencies: Pro.JS, Pro.Collections.JS, Pro.XML.JS
Questions/Comments: jacobheater@gmail.com,
License: Open Source under MIT License @ https://github.com/JacobHeater/Pro.js/blob/Version-2.0/LICENSE,
Version: 2.0
}
 ****************************************************************************
 *****************************************************************************
 *****************************************************************************/
define('pro.serialization', ['pro', 'pro.collections', 'pro.xml'], function (pro, collections, xml) {
    "use strict";
    /*@ Purpose: Provides an API for serializing/deserializing different object types into their respective byte[] format.
    @ Namespace: pro.serialization*/
    pro.module('serialization', pro.object({
        extend: pro.extend,
        /*@ Purpose: Provides an API for serializing/deserializing strings into their respective outputs.
        @ Namespace: pro.serialization.string*/
        string: pro.object({
            /*@ Purpose: Serializes a string into a byte array and returns the serialized bytes.
            @ Param: params -> implicit: Can be a string or byte array of existing character encodings that will be joined and reserialized.
            @ Returns: byte[] -> The string in its serialized byte form.*/
            getBytes: function (params) {
                var bytes = [];
                if (pro.isString(arguments[0])) {
                    var string = arguments[0];
                    pro.$for(0, string.length, function (index) {
                        var char = string[index];
                        var byte = pro.string.charCodeAt(char);
                        bytes.push(byte);
                    });
                } else if (pro.isArray(arguments[0])) {
                    var chars = arguments[0];
                    var string = chars.join('');
                    bytes = this.getBytes(string);
                }
                return bytes;
            },
            /*@ Purpose: Takes a bytes array and converts it back into its respective character array.
            @ Param: bytes -> byte[]: The byte array that should be deserialized back into a character array.
            @ Returns: char[] -> The bytes deserialized into a character array.*/
            getChars: function (bytes) {
                var chars = [];
                if (pro.isArray(bytes)) {
                    pro.$for(bytes, function (i, byte) {
                        var char = String.fromCharCode(byte);
                        chars.push(char);
                    });
                }
                return chars;
            },
            /*@ Purpose: Takes a byte array and converts it back into its string representation.
            @ Param: bytes -> byte[]: The byte array that should be deserialized back into its string representation.
            @ Returns: String -> The bytes deserialized back into string format.*/
            getString: function (bytes) {
                return this.getChars(bytes).join('');
            }
        }),
        /*@ Purpose: Provides an API for serializing/deserializing objects into their respective outputs.
        @ Namespace: pro.serialization.object*/
        object: pro.object({
            /*@ Purpose: Serializes an object into a byte[] by first serializing it as JSON and then serializing the string as a byte[].
            @ Param: obj -> Object: The object to serialize.
            @ Returns: byte[] -> The object serialized into a byte[]*/
            getBytes: function (obj) {
                var bytes = [];
                if (pro.isObject(obj)) {
                    var string = pro.toJson(obj);
                    var bytes = pro.serialization.string.getBytes(string);
                    bytes = bytes;
                }
                return bytes;
            },
            /*@ Purpose: Deserializes an object into its respective JavaScript object form.
            @ Param: bytes -> byte[]: The byte array to deserialize back into an object.
            @ Returns: The deserialized object*/
            getObject: function (bytes) {
                var object = pro.object();
                if (pro.isArray(bytes)) {
                    var string = pro.serialization.string.getString(bytes);
                    var parsedJson = pro.parseJson(string);
                    object = parsedJson;
                }
                return object;
            }
        }),
        json: pro.object({
            getJson: function (obj) {
                return pro.toJson(obj);
            },
            getObject: function (json) {
                return pro.parseJson(json);
            }
        }),
        xml: pro.object({
            stringFormatter: pro.$class('pro.serialization.xml.stringFormatter', function () {
                this.format = function (xml) {
                    return xml = pro.stringFormatter('{0}\r\n', xml);
                };
            }),
            getXml: function (obj, config) {
                var formatter = pro.isDefined(config.stringFormatter) && pro.isClass(config.stringFormatter) && config.stringFormatter.is(pro.serialization.xml.stringFormatter) ? config.stringFormatter : new pro.serialization.xml.stringFormatter();
                var namespace = pro.isObject(config.namespace) && pro.isString(config.namespace.name) && pro.isString(config.namespace.url) ? config.namespace : null;
                var xmlHeader = pro.stringFormatter('<?xml version="1.0" encoding="UTF-8" {0}?>\r\n', namespace !== null ? pro.stringFormatter('xmlns:{0}="{1}"', namespace.name, namespace.url) : pro.emptyString);
                var parent = pro.isString(config.parent) ? (function () {
                    var _parent = pro.object();
                    _parent[config.parent] = obj;
                    return _parent;
                })() : obj;
                var xml = xmlHeader;
                var generateIndent = function (n) {
                    var indent = "";
                    pro.$for(0, n, function (i) {
                        indent += "\t";
                    });
                    return indent;
                };
                var parser = function (obj, level) {
                    var xmlBuilder = new pro.stringBuilder();
                    pro.enumerateObject(obj, function (key, value) {
                        if (!pro.isFunction(value)) {
                            var nodeFormat = namespace !== null ? "" + namespace.name + ":{0}" : "{0}";
                            var nodeOpen = pro.stringFormatter("<" + nodeFormat + ">", key);
                            var nodeClose = pro.stringFormatter("</" + nodeFormat + ">", key);
                            var selfClose = pro.stringFormatter('<' + nodeFormat + ' nil="true" />', key);
                            var node = pro.emptyString;
                            if (pro.isDefined(value)) {
                                if (pro.isObject(value) && pro.propCount(value) > 0) {
                                    node += generateIndent(level) + nodeOpen;
                                    node = formatter.format(node);
                                    node += parser(value, level + 1);
                                    node += generateIndent(level) + nodeClose;
                                } else if (!pro.isObject(value) && pro.isDefined(value)) {
                                    node += generateIndent(level) + nodeOpen;
                                    node += value;
                                    node += nodeClose;
                                } else {
                                    node = generateIndent(level) + selfClose;
                                }
                            } else {
                                node = generateIndent(level) + selfClose;
                            }
                            node = formatter.format(node);
                            xmlBuilder.append(node);
                        }
                    });
                    return xmlBuilder.toString();
                };
                if (pro.isObject(parent)) {
                    xml += parser(parent, 0);
                }
                return xml;
            },
            getObject: function (xml, config) {
                var document = new xml.xmlReader(xml, config).read();
                var children = document.children();
                var type = pro.isFunction(config.constructor) ? new config.constructor() : {};
                window.xmlDoc = document;
                return xml;
            }
        })
    }));
    return pro.serialization;
});