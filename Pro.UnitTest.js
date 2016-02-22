/****************************************************************************
 *****************************************************************************
 *****************************************************************************{
Summary: Pro.UnitTest.JS - An extension of the Pro.js library that allows for
unit testing of code. The extension provides a simple API for validating your code before moving it to
production.,
Author: Jacob Heater,
Dependencies: Pro.js,
Questions/Comments: jacobheater@gmail.com,
License: Open Source under MIT License @ https://github.com/JacobHeater/Pro.js/blob/Version-2.0/LICENSE,
Version: 2.0
}
 *****************************************************************************
 *****************************************************************************
 *****************************************************************************/
define('pro.unittest', ['pro'], function (pro) {
    "use strict";
    var internal = pro.object({
        exceptions: pro.object({
            areEqualException: pro.$class('pro.unitTest.areEqualException << pro.exception', function () {
                this.initializeBase('Object 1 is not equal to Object 2!', new Error('Unit Test - areEqual => obj1 is not equal to obj2!'));
                this.message = this.base.message;
            }, pro.exception),
            isTrueException: pro.$class('pro.unitTest.isTrueException << pro.exception', function () {
                this.initializeBase('The given value did not evaluate to true!', new Error('Unit Test - isTrue => boolean did not evaluate to true!;'));
                this.message = this.base.message;
            }, pro.exception),
            isFalseException: pro.$class('pro.unitTest.isFalseException << pro.exception', function () {
                this.initializeBase('The given value did not evaluate to false!', new Error('Unit Test - isFalse => boolean did not evaluate to false!;'));
                this.message = this.base.message;
            }, pro.exception)
        })
    });
    pro.module('unitTest', pro.object({
        affirm: pro.object({
            areEqual: function (obj1, obj2) {
                if (pro.areEqual(obj1, obj2)) {
                    console.info('Affirm equality check passed!');
                } else {
                    console.error(new internal.exceptions.areEqualException());
                    console.error("Object1: " + obj1, "Object2: " + obj2);
                }
            },
            isTrue: function (boolean) {
                if (boolean === true) {
                    console.info('Affirm is true check passed!');
                } else {
                    console.error(new internal.exceptions.isTrueException());
                }
            },
            isFalse: function (boolean) {
                if (!this.isTrue(boolean)) {
                    console.info('Affirm is false check passed!');
                } else {
                    console.error(new internal.exceptions.isFalseException());
                }
            }
        })
    }));
    return pro.unitTest;
});