/****************************************************************************
 *****************************************************************************
 *****************************************************************************{
Summary: Pro.Encoding.JS - An extension of the Pro.JS library that offers
a high-level API of string encoding standards for JavaScript.,
Author: Jacob Heater,
Dependencies: Pro.JS, Pro.Serialization.JS
Questions/Comments: jacobheater@gmail.com,
License: Open Source under MIT License @ https://github.com/JacobHeater/Pro.js/blob/Version-2.0/LICENSE,
Version: 2.0
}
 ****************************************************************************
 *****************************************************************************
 *****************************************************************************/
define('pro.encoding', ['pro', 'pro.serialization'], function (pro, serialization) {
    "use strict";
    /*@ Purpose: Provides an API for string encoding standards with various encoding types.
    @ Namespace: pro.encoding*/
    pro.module('encoding', pro.object({
        extend: pro.extend,
        /*@ Purpose: Provides an API for encoding and decoding Base64 strings.
        @ Namespace: pro.encoding.base64*/
        base64: pro.object({
            /*@ Purpose: Encodes a byte array or string in Base64 format and returns the encoded string.
            @ Param: params -> implicit: Can be a byte[] or string. If a byte[] will be converted to a string before encoding.
            @ Returns: String -> The Base64 encoded string.*/
            encodeBase64: function (params) {
                var base64 = pro.emptyString;
                if (pro.isArray(arguments[0])) {
                    var bytes = arguments[0];
                    var string = pro.serialization.string.getString(bytes);
                    base64 = this.encodeBase64(string);
                } else if (pro.isString(arguments[0])) {
                    var string = arguments[0];
                    /*Source Mozilla Developer Network*/
                    base64 = btoa(encodeURIComponent(string).replace(/%([0-9A-F]{2})/g, function (match, p1) {
                        return String.fromCharCode('0x' + p1);
                    }));
                }
                return base64;
            },
            /*@ Purpose: Decodes a Base64 string, as long as the string is in valid format and returns the decoded string value.
            @ Param: base64 -> string: The Base64 string that is to be decoded.
            @ Returns: String -> The decoded string.*/
            decodeBase64: function (base64) {
                var str = pro.emptyString;
                if (pro.isString(base64)) {
                    str = atob(base64);
                }
                return str;
            }
        })
    }));
    return pro.encoding;
});
