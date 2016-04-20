//Tests for the ProJS core library
describe("Pro Core Library", function () {
    describe("Object Mutation", function () {
        describe("pro.extend", function () {
            it("Should extend object B properties to object A", function () {
                var objB = {
                    prop1: {
                        bool: true
                    },
                    prop2: 1000,
                    prop3: 'false'
                };
                var objA = {};
                var objAHashTable = pro.getHashTable(objA);
                expect(objAHashTable.length).toEqual(0);
                pro.extend(objA, objB);
                objAHashTable = pro.getHashTable(objA);
                expect(objAHashTable.length).toEqual(3);
                expect(objA.prop1).toEqual(objB.prop1);
                expect(objA.prop2).toEqual(objB.prop2);
                expect(objA.prop3).toEqual(objB.prop3);
            });
        });
        describe("pro.flattenArray", function () {
            it("Should flatten a n-dimensional array into a 1-dimensional array", function () {
                var dimensional = [1, [2, [3, 4, [5]]], [6]];
                var actual = [1, 2, 3, 4, 5, 6];
                var flattened = pro.flattenArray(dimensional);
                for (var i = 0; i < actual.length; i++) {
                    expect(flattened[i]).toEqual(actual[i]);
                }
            });
        });
    });
    describe("Object Type Detection", function () {
        describe("pro.isArray", function () {
            it("Should detect when an object is an array type", function () {
                var actualArray = [1, 2, 3, 4, 5];
                expect(pro.isArray(actualArray)).toEqual(true);
            });
            it("Should detect when an objet is not an array type", function () {
                var nonArray = { length: 0, splice: function () { } };
                expect(pro.isArray(nonArray)).toEqual(false);
            });
        });
    });
    describe("Pro GUID Capabilities", function () {
        describe("pro.GUID Namespace", function () {
            it("Should create two distinct identifiers", function () {
                var first = pro.GUID.create();
                var second = pro.GUID.create();
                expect(first === second).toEqual(false);
            });
            it("Should create identifiers that are not empty", function () {
                var identifier = pro.GUID.create();
                expect(identifier === pro.GUID.$default).toEqual(false);
            })
        });
    });
    describe("Pro String Capabilities", function () {
        describe("pro.string Namespace", function () {
            it("Should know when an empty string is empty", function () {
                var empty = pro.emptyString;
                expect(pro.string.isEmpty(empty)).toEqual(true);
            });
            it("Should convert a lower-case string to title-case", function () {
                var actual = "this is a test";
                var expected = "This Is a Test";
                var titleCased = pro.string.toTitleCase(actual);
                expect(titleCased).toEqual(expected);
            });
        });
        describe("pro.stringFormatter", function () {
            it("Should format a string based on numerical tokens in the string", function () {
                var format = "Hello, {0}{1}";
                var str = pro.stringFormatter(format, "world", "!");
                var actual = "Hello, world!";
                expect(str).toEqual(actual);
            });
            it("Should format a string based on object property tokens in the string", function () {
                var format = "Hello! My name is {firstName} {lastName}!";
                var str = pro.stringFormatter(format, {
                    firstName: 'Jacob',
                    lastName: 'Heater'
                });
                var actual = "Hello! My name is Jacob Heater!";
                expect(str).toEqual(actual);
            });
        });
        describe("pro.stringBuilder", function () {
            it("Should append values to the string", function () {
                var str = "";
                var builder = new pro.stringBuilder();
                var actual = "Test";
                builder.append("T").append("e").append("s").append("t");
                str = builder.toString();
                expect(str).toEqual(actual);
            });
            it("Should prepend values to the string", function () {
                var str = "";
                var builder = new pro.stringBuilder();
                var actual = "Test";
                builder.prepend("t").prepend("s").prepend("e").prepend("T");
                str = builder.toString();
                expect(str).toEqual(actual);
            });
        });
        describe("pro.emptyString", function () {
            it("Should always equal an empty string", function () {
                expect(pro.emptyString).toEqual("");
            });
        });
    });
});