/****************************************************************************
*****************************************************************************
*****************************************************************************
{
    Summary: Pro.Cryptography.JS - An extension of the Pro.JS library that offers
             a class set and API for encryption using the pro 512 bit encryption standard.,
    Author: Jacob Heater,
    Dependencies:
        1. Pro.JS
        2. Pro.Serialization.JS,
        3. Pro.Collections.JS
    Questions/Comments: jacobheater@gmail.com,
    License: Open Source under MIT License @ https://github.com/JacobHeater/Pro.js/blob/Version-2.0/LICENSE,
    Version: 2.0
}
****************************************************************************
*****************************************************************************
*****************************************************************************/
(function(pro) {
    /*@ Purpose: Provides an API for cryptography related functions in JavaScript.
        @ Namespace: pro.cryptography*/
    pro.module('cryptography', pro.object({
        /*@ Purpose: Encapsulates all of the Pro.js cryptography related functions.
            @ Namespace: pro.cryptography.exoCrypt*/
        exoCrypt: pro.object({
            /*@ Purpose: A $class constructor that provides all of the capabilities to create a 2-way encrypted data package and to decrypt the package.
                @ Param: password -> string: The password to set for the encrypted data package to retrieve it later.
                @ Param: salt? -> string: A salt for the password to make it more secure.
                @ Param: channel -> pro.cryptography.exoCrypt.exoCryptChannel: The channel that contains the phone number for 2-step authentication.
                @ Returns: Object -> The initialized instance of the pro.cryptography.exoCrypt.exoCrypt object. */
            exoCrypt: pro.$class('pro.cryptography.exoCrypt.exoCrypt', function(password, salt, channel) {
                var $this = this;
                var $arguments = arguments;
                var _salt = pro.emptyString;
                var _hashedSalt = pro.emptyString;
                var _hashedPassword = pro.emptyString;
                var _mixin = pro.emptyString;
                var _primiToken = pro.emptyString;
                var _nonPrimiToken = pro.emptyString;
                var _password = pro.emptyString;
                var _hasher = pro.cryptography.exoHash.exoHasher.instance;
                var _serializer = pro.serialization.string;
                var _sourceToken = pro.emptyString;
                var _possibleSources = pro.object({
                    client: _sourceToken,
                    server: '::<encryptionSource>server</encryptionSource>::'
                });
                var initialize = function() {
                    if($arguments.length === 2 && pro.isObject($arguments[1])) {
                        _salt = "exocrypt_salt";
                        $this.Channel = $arguments[1];
                    } else if($arguments.length === 3) {
                        _salt = salt;
                        $this.Channel = channel;
                    }
                    _password = password;
                    _primiToken = "::<type>neanderthal</type>::";
                    _nonPrimiToken = "::<type>composite</type>::";
                    _sourceToken = "::<encryptionSource>client</encryptionSource>::";
                    _hashedSalt = _serializer.getString(_hasher.computeHash(_salt));
                    _hashedPassword = _serializer.getString(_hasher.computeHash(_password));
                    _mixin = pro.stringFormatter('//-{0}-//', _hashedSalt + _hashedPassword);
                };
                this.Channel;
                this.ProxyInstance;
                this.IsConnected;
                this.Decrypt = function(exoCryptPackage) {
                    var output = pro.object();
                    if(exoCryptPackage && this.IsConnected && exoCryptPackage.IsConnected && exoCryptPackage.ProxyInstance && this.ProxyInstance && exoCryptPackage.ProxyInstance.ID == this.ProxyInstance.ID && this.ProxyInstance.IsValidConnection && exoCryptPackage.ProxyInstance.IsValidConnection) {
                        if(exoCryptPackage.Token === _hashedPassword && !exoCryptPackage.IsLocked) {
                            var data = exoCryptPackage.Data;
                            var realData = data.replace(_mixin, pro.emptyString).replace(_mixin, pro.emptyString);
                            realData = realData.replace(_sourceToken, pro.emptyString).replace(_possibleSources.client, pro.emptyString).replace(_possibleSources.server, pro.emptyString);
                            if(pro.string.contains(realData, _nonPrimiToken)) {
                                realData = realData.replace(_nonPrimiToken, pro.emptyString);
                                output = pro.encoding.base64.decodeBase64(realData);
                                output = pro.parseJson(output);
                            } else if(pro.string.contains(realData, _primiToken)) {
                                realData = realData.replace(_primiToken, pro.emptyString);
                                output = pro.encoding.base64.decodeBase64(realData);
                                output = pro.parseJson(output);
                            }
                            exoCryptPackage.DecryptAttempts = 0;
                        }
                    } else {
                        exoCryptPackage.DecryptAttempts++;
                        if(exoCryptPackage.DecryptAttempts === 3) {
                            exoCryptPackage.IsLocked = true;
                        }
                    }
                    return output;
                };
                this.Encrypt = function(obj) {
                    var bytes = [];
                    var isPrimitive = false;
                    if(pro.isString(obj)) {
                        bytes = pro.serialization.string.getBytes(obj);
                        isPrimitive = false;
                    } else if(pro.isObject(obj)) {
                        bytes = pro.serialization.object.getBytes(obj);
                        isPrimitive = false;
                    } else if(obj && !pro.isObject(obj)) {
                        bytes = pro.serialization.object.getBytes(obj);
                        isPrimitive = true;
                    } else {
                        bytes = pro.serialization.object.getBytes(obj);
                        isPrimitive = false;
                    }
                    var base64String = pro.encoding.base64.encodeBase64(bytes);
                    base64String += isPrimitive ? _primiToken : _nonPrimiToken;
                    var firstIndex = pro.math.random(0, (base64String.length - 1) / 2);
                    var secondIndex = 0;
                    base64String = pro.string.insert(base64String, firstIndex, _mixin);
                    var indexPadding = 2;
                    secondIndex = pro.math.random((firstIndex + _mixin.length + indexPadding), (base64String.length - 1));
                    base64String = pro.string.insert(base64String, secondIndex, _mixin);
                    base64String += _sourceToken;
                    return new pro.cryptography.exoCrypt.exoCryptPackage(base64String, _hashedPassword, isPrimitive, new pro.cryptography.exoCrypt.exoCryptChannel(this.Channel.PhoneNumber), false);
                };
                initialize();
            }),
            /*@ Purpose: A $class constructor that represents a package of encrypted data that was created by the pro.cryptography.exoCrypt.exoCrypt class.
                @ Param: data -> string: The ecnrypted data in its string format.
                @ Param: token -> string: The hashed password that will be used to authenticate the cryptographer.
                @ Param: isPrimiive -> boolean: Indicates if the data derives from a primitive or reference type.
                @ Param: channel -> pro.cryptography.exoCrypt.exoCryptChannel: The channel that will be used to authenticate the user's phone number.
                @ Param: locked? -> boolean: Indicates if the package is locked and prohibited from being decrypted.
                @ Returns: Object -> The intialized instance of the pro.cryptography.exoCrypt.exoCryptPackage class.*/
            exoCryptPackage: pro.$class('pro.cryptography.exoCrypt.exoCryptPackage', function(data, token, isPrimitive, channel, locked) {
                this.Data = data;
                this.Token = token;
                this.IsPrimitive = isPrimitive;
                this.IsLocked = locked || false;
                this.DecryptAttempts = 0;
                this.Channel = channel;
                this.IsServerPackage = function() {
                    return this.Data.indexOf("::<encryptionSource>client</encryptionSource>::") <= -1;
                };
            }).static({
                serialize: function(exoCryptPackage) {
                    return pro.toJson(exoCryptPackage);
                },
                deserialize: function(json) {
                    var exoCryptPackage = pro.parseJson(json);
                    if(pro.areDefined(exoCryptPackage.Token, exoCryptPackage.Data, exoCryptPackage.IsLocked, exoCryptPackage.Channel)) {
                        exoCryptPackage = new pro.cryptography.exoCrypt.exoCryptPackage(exoCryptPackage.Data, exoCryptPackage.Token, exoCryptPackage.IsPrimitive, exoCryptPackage.Channel, exoCryptPackage.IsLocked);
                        exoCryptPackage.Channel = new pro.cryptography.exoCrypt.exoCryptChannel(exoCryptPackage.Channel.PhoneNumber);
                    }
                    return exoCryptPackage;
                }
            }),
            /*@ Purpose: A $class constructor that represents a channel that contains a phone number. Used for 2-step authentication of the pro 2-way authentication algorithm.
                @ Param: phoneNumber -> string: The phone number to be used to map to the authentication chain for 2-step authentication.
                @ Returns: Object -> The initialized instance of the pro.cryptography.exoCrypt.exoCryptChannel class.
                @ Throws: ReferenceError -> phoneNumber must be defined.*/
            exoCryptChannel: pro.$class('pro.cryptography.exoCrypt.exoCryptChannel', function(phoneNumber) {
                if(pro.isString(phoneNumber)) {
                    this.PhoneNumber = phoneNumber;
                    this.IsConnected = false;;
                    this.ConnectorProxy = null;
                    this.Destroy = function() {
                        this.ConnectorProxy = null;
                        this.IsConnected = false;
                        this.PhoneNumber = null;
                    };
                } else {
                    throw new ReferenceError("Arguments[0]:phoneNumber was not defined! Please set a phoneNumber to continue using the channel.");
                }
            }).static({
                /*@ Purpose: A factory function for creating an instance of the pro.cryptography.exoCrypt.exoCryptChannel class.
                    @ Param: phoneNumber -> string: The phone number to be used to map to the authentication chain for 2-step authentication.
                    @ Returns: Object -> The initialized instance of the pro.cryptography.exoCrypt.exoCryptChannel class.
                    @ Throws: ReferenceError -> phoneNumber must be defined.*/
                create: function(phoneNumber) {
                    return new pro.cryptography.exoCrypt.exoCryptChannel(phoneNumber);
                }
            }),
            /*@ Purpose: A $class consturctor that serves as a middle man between an encrypted data package and a cryptographer. This class must be used in order decrypt exoCryptPackages.
                @ Param: cryptographer -> pro.cryptography.exoCrypt.exoCrypt: The instance of the cryptographer used to decrypt the package.
                @ Param: exoCryptPackage -> pro.cryptography.exoCrypt.exoCryptPackage: The package that will be decrypted.
                @ Param: channel -> pro.cryptography.exoCrypt.exoCryptChannel: The channel instance that will be used for 2-step authentication.
                @ Returns: Object -> The intialized instance of the pro.cryptography.exoCrypt.exoCryptDecryptionProxy class.*/
            exoCryptDecryptionProxy: pro.$class('pro.cryptography.exoCrypt.exoCryptDecryptionProxy << pro.disposable', function(cryptographer, exoCryptPackage, channel) {
                this.initializeBase();
                this.Package = exoCryptPackage;
                this.Cryptographer = cryptographer;
                this.ID = pro.GUID.create();
                this.IsConnectionOpen = false;
                this.IsValidConnection = false;
                this.Channel = channel;
                this.Decrypt = function() {
                    var data = pro.object();
                    if(this.IsConnectionOpen) {
                        data = this.Cryptographer.Decrypt(this.Package);
                    }
                    return data;
                };
                this.OpenChannel = function() {
                    if(this.Cryptographer && this.Package && this.Cryptographer.Channel.PhoneNumber == this.Channel.PhoneNumber && this.Package.Channel.PhoneNumber == this.Channel.PhoneNumber) {
                        this.Cryptographer.IsConnected = true;
                        this.Package.IsConnected = true;
                        this.Cryptographer.ProxyInstance = this;
                        this.Package.ProxyInstance = this;
                        this.Cryptographer.Channel.IsConnected = true;
                        this.Package.Channel.IsConnected = true;
                        this.Cryptographer.Channel.ConnectorProxy = this;
                        this.Package.Channel.ConnectorProxy = this;
                        this.Channel.ConnectorProxy = this;
                        this.Channel.IsConnected = true;
                        this.IsValidConnection = true;
                        this.IsConnectionOpen = true;
                    } else {
                        throw new Error('Invalid credentials! Connection aborted!');
                    }
                    return this;
                };
                this.CloseChannel = function() {
                    if(this.Package && this.Cryptographer) {
                        this.Package.IsConnected = false;
                        this.Cryptographer.IsConnected = false;
                        this.Cryptographer.ProxyInstance = null;
                        this.Package.ProxyInstance = null;
                        this.Cryptographer.Channel.Destroy();
                        this.Package.Channel.Destroy();
                        this.Channel.Destroy();
                        this.IsConnectionOpen = false;
                        this.IsValidConnection = false;
                    }
                    return this;
                };
                this.overrides = pro.object({
                    Dispose: 'Dispose'
                });
                this.Dispose = function() {
                    this.CloseChannel();
                };
                this.OpenChannel();
            }, pro.disposable)
        }),
        /*@ Purpose: Contains an API for hashing functions in JavaScript using the propietary exoHasher algorithm.
            @ Namespace: pro.cryptography.exoHash.*/
        exoHash: pro.object({
            /*@ Purpose: A singleton instance used for computing hashes of strings in JavaScript.
                @ Returns: Object -> The singleton instance property for the exoHasher class.*/
            exoHasher: pro.singleton('pro.cryptography.exoHash.exoHasher', {
                computeHash: function(params) {
                    if(arguments.length === 2) {
                        if(pro.isArray(arguments[0])) {
                            var incoming = arguments[0];
                            var rounder = function(n) {
                                return Math.ceil(Math.round(n))
                            };
                            var hash = [];
                            if(incoming.length > 0) {
                                var salt = pro.string.scramble.calculated("Ëf!½á2Ïµ[Ã$WOE&Be½p|Mí«êãDÓâf¼îmsÙ!GÀôÉs)¦Ð_þ0o-Jh}pÄ¨»+[H+¶,qT_o¯ji= _½u®", 2);
                                var filler = pro.string.scramble.calculated("ex0T00l$¬ôFjã3=Á8Vd°WWsffíð!^gq7gÁiF!ó1¦C2Ò«&ò.°Ðó·þãÙ	ÉùÉ	q.&$ïÛ	 K!I~iØ/ð(Æûü9ffi113r$7trin670m4k3$ur37h3r34r33n0u6hby73$", 3)
                                var strIncoming = pro.serialization.string.getString(incoming);
                                var scrambleIncoming = pro.string.scramble.calculated(strIncoming, 5);
                                filler = scrambleIncoming + salt + filler;
                                var fillerBytes = pro.serialization.string.getBytes(filler);
                                var max = 255;
                                var multiple = 2;
                                var obfuscated = 3;
                                var _byte = 0;
                                var root = obfuscated;
                                var bytes = [];
                                var chars = [];
                                var byteObfuscated = 0;
                                var multiplyRoot = function(n) {
                                    return n * root;
                                };
                                var calculate = function(b, n) {
                                    var value = ((((b + 2) * n / max) + 7 * 0.02));
                                    value = value > (max / 100) ? value * 10 : value * 100;
                                    return rounder(value);
                                };
                                var position = 0;
                                var nBits = pro.isNumber(arguments[1]) && arguments[1] >= 512 && arguments[1] % 8 === 0 ? arguments[1] : 1024;
                                var nBytes = nBits / 8;
                                var mangleBytes = function(toMangle) {
                                    var _copyToMangle = toMangle.slice(0);
                                    pro.$for(_copyToMangle, function(i, b) {
                                        _byte = b;
                                        if(_byte <= root) {
                                            obfuscated = calculate(_byte, multiple);
                                        } else if(_byte <= multiplyRoot(2)) {
                                            obfuscated = calculate(_byte, multiple + 1);
                                        } else if(_byte <= multiplyRoot(3)) {
                                            obfuscated = calculate(_byte, multiple + 2);
                                        } else if(_byte <= multiplyRoot(4)) {
                                            obfuscated = calculate(_byte, multiple + 3);
                                        } else if(_byte <= multiplyRoot(5)) {
                                            obfuscated = calculate(_byte, multiple + 4);
                                        } else if(_byte <= multiplyRoot(6)) {
                                            obfuscated = calculate(_byte, multiple + 5);
                                        } else if(_byte <= multiplyRoot(7)) {
                                            obfuscated = calculate(_byte, multiple + 6);
                                        } else if(_byte <= multiplyRoot(8)) {
                                            obfuscated = calculate(_byte, multiple + 7);
                                        } else if(_byte <= multiplyRoot(9)) {
                                            obfuscated = calculate(_byte, multiple + 8);
                                        } else if(_byte <= multiplyRoot(10)) {
                                            obfuscated = calculate(_byte, multiple + 9);
                                        } else if(_byte <= multiplyRoot(11)) {
                                            obfuscated = calculate(_byte, multiple + 10);
                                        } else if(_byte <= multiplyRoot(12)) {
                                            obfuscated = calculate(_byte, multiple + 11);
                                        } else if(_byte <= multiplyRoot(13)) {
                                            obfuscated = calculate(_byte, multiple + 12);
                                        } else if(_byte <= multiplyRoot(14)) {
                                            obfuscated = calculate(_byte, multiple + 13);
                                        } else if(_byte <= multiplyRoot(15)) {
                                            obfuscated = calculate(_byte, multiple + 14);
                                        } else if(_byte <= multiplyRoot(16)) {
                                            obfuscated = calculate(_byte, multiple + 15);
                                        } else if(_byte <= multiplyRoot(17)) {
                                            obfuscated = calculate(_byte, multiple + 16);
                                        } else if(_byte <= multiplyRoot(18)) {
                                            obfuscated = calculate(_byte, multiple + 15);
                                        } else if(_byte <= multiplyRoot(19)) {
                                            obfuscated = calculate(_byte, multiple + 14);
                                        } else if(_byte <= multiplyRoot(20)) {
                                            obfuscated = calculate(_byte, multiple + 13);
                                        } else if(_byte <= multiplyRoot(21)) {
                                            obfuscated = calculate(_byte, multiple + 12);
                                        } else if(_byte <= multiplyRoot(22)) {
                                            obfuscated = calculate(_byte, multiple + 11);
                                        } else if(_byte <= multiplyRoot(23)) {
                                            obfuscated = calculate(_byte, multiple + 10);
                                        } else if(_byte <= multiplyRoot(24)) {
                                            obfuscated = calculate(_byte, multiple + 9);
                                        } else if(_byte <= multiplyRoot(25)) {
                                            obfuscated = calculate(_byte, multiple + 8);
                                        } else if(_byte <= multiplyRoot(26)) {
                                            obfuscated = calculate(_byte, multiple + 7);
                                        } else if(_byte <= multiplyRoot(27)) {
                                            obfuscated = calculate(_byte, multiple + 6);
                                        } else if(_byte <= multiplyRoot(28)) {
                                            obfuscated = calculate(_byte, multiple + 5);
                                        } else if(_byte <= multiplyRoot(29)) {
                                            obfuscated = calculate(_byte, multiple + 4);
                                        } else if(_byte <= multiplyRoot(30)) {
                                            obfuscated = calculate(_byte, multiple + 3);
                                        } else if(_byte <= multiplyRoot(31)) {
                                            obfuscated = calculate(_byte, multiple + 2);
                                        } else if(_byte <= multiplyRoot(32)) {
                                            obfuscated = calculate(_byte, multiple + 1);
                                        } else if(_byte <= multiplyRoot(33)) {
                                            obfuscated = calculate(_byte, multiple + 2);
                                        } else if(_byte <= multiplyRoot(34)) {
                                            obfuscated = calculate(_byte, multiple + 3);
                                        } else if(_byte <= multiplyRoot(35)) {
                                            obfuscated = calculate(_byte, multiple + 4);
                                        } else if(_byte <= multiplyRoot(36)) {
                                            obfuscated = calculate(_byte, multiple + 5);
                                        } else if(_byte <= multiplyRoot(37)) {
                                            obfuscated = calculate(_byte, multiple + 6);
                                        } else if(_byte <= multiplyRoot(38)) {
                                            obfuscated = calculate(_byte, multiple + 7);
                                        } else if(_byte <= multiplyRoot(39)) {
                                            obfuscated = calculate(_byte, multiple + 8);
                                        } else if(_byte <= multiplyRoot(40)) {
                                            obfuscated = calculate(_byte, multiple + 9);
                                        } else if(_byte <= multiplyRoot(41)) {
                                            obfuscated = calculate(_byte, multiple + 10);
                                        } else if(_byte <= multiplyRoot(42)) {
                                            obfuscated = calculate(_byte, multiple + 11);
                                        } else if(_byte <= multiplyRoot(43)) {
                                            obfuscated = calculate(_byte, multiple + 12);
                                        } else if(_byte <= multiplyRoot(44)) {
                                            obfuscated = calculate(_byte, multiple + 13);
                                        } else if(_byte <= multiplyRoot(45)) {
                                            obfuscated = calculate(_byte, multiple + 14);
                                        } else if(_byte <= multiplyRoot(46)) {
                                            obfuscated = calculate(_byte, multiple + 15);
                                        } else if(_byte <= multiplyRoot(47)) {
                                            obfuscated = calculate(_byte, multiple + 16);
                                        } else if(_byte <= multiplyRoot(48)) {
                                            obfuscated = calculate(_byte, multiple + 15);
                                        } else if(_byte <= multiplyRoot(49)) {
                                            obfuscated = calculate(_byte, multiple + 14);
                                        } else if(_byte <= multiplyRoot(50)) {
                                            obfuscated = calculate(_byte, multiple + 13);
                                        } else if(_byte <= multiplyRoot(51)) {
                                            obfuscated = calculate(_byte, multiple + 12);
                                        } else if(_byte <= multiplyRoot(52)) {
                                            obfuscated = calculate(_byte, multiple + 11);
                                        } else if(_byte <= multiplyRoot(53)) {
                                            obfuscated = calculate(_byte, multiple + 10);
                                        } else if(_byte <= multiplyRoot(54)) {
                                            obfuscated = calculate(_byte, multiple + 9);
                                        } else if(_byte <= multiplyRoot(55)) {
                                            obfuscated = calculate(_byte, multiple + 8);
                                        } else if(_byte <= multiplyRoot(56)) {
                                            obfuscated = calculate(_byte, multiple + 7);
                                        } else if(_byte <= multiplyRoot(57)) {
                                            obfuscated = calculate(_byte, multiple + 6);
                                        } else if(_byte <= multiplyRoot(58)) {
                                            obfuscated = calculate(_byte, multiple + 5);
                                        } else if(_byte <= multiplyRoot(59)) {
                                            obfuscated = calculate(_byte, multiple + 4);
                                        } else if(_byte <= multiplyRoot(60)) {
                                            obfuscated = calculate(_byte, multiple + 3);
                                        } else if(_byte <= multiplyRoot(61)) {
                                            obfuscated = calculate(_byte, multiple + 2);
                                        } else if(_byte <= multiplyRoot(62)) {
                                            obfuscated = calculate(_byte, multiple + 1);
                                        } else if(_byte <= multiplyRoot(63)) {
                                            obfuscated = calculate(_byte, multiple + 2);
                                        } else if(_byte <= multiplyRoot(64)) {
                                            obfuscated = calculate(_byte, multiple + 3);
                                        } else if(_byte <= multiplyRoot(65)) {
                                            obfuscated = calculate(_byte, multiple + 4);
                                        } else if(_byte <= multiplyRoot(66)) {
                                            obfuscated = calculate(_byte, multiple + 5);
                                        } else if(_byte <= multiplyRoot(67)) {
                                            obfuscated = calculate(_byte, multiple + 6);
                                        } else if(_byte <= multiplyRoot(68)) {
                                            obfuscated = calculate(_byte, multiple + 7);
                                        } else if(_byte <= multiplyRoot(69)) {
                                            obfuscated = calculate(_byte, multiple + 8);
                                        } else if(_byte <= multiplyRoot(70)) {
                                            obfuscated = calculate(_byte, multiple + 9);
                                        } else if(_byte <= multiplyRoot(71)) {
                                            obfuscated = calculate(_byte, multiple + 10);
                                        } else if(_byte <= multiplyRoot(72)) {
                                            obfuscated = calculate(_byte, multiple + 11);
                                        } else if(_byte <= multiplyRoot(73)) {
                                            obfuscated = calculate(_byte, multiple + 12);
                                        } else if(_byte <= multiplyRoot(74)) {
                                            obfuscated = calculate(_byte, multiple + 13);
                                        } else if(_byte <= multiplyRoot(75)) {
                                            obfuscated = calculate(_byte, multiple + 14);
                                        } else if(_byte <= multiplyRoot(76)) {
                                            obfuscated = calculate(_byte, multiple + 15);
                                        } else if(_byte <= multiplyRoot(77)) {
                                            obfuscated = calculate(_byte, multiple + 16);
                                        } else if(_byte <= multiplyRoot(78)) {
                                            obfuscated = calculate(_byte, multiple + 15);
                                        } else if(_byte <= multiplyRoot(79)) {
                                            obfuscated = calculate(_byte, multiple + 14);
                                        } else if(_byte <= multiplyRoot(80)) {
                                            obfuscated = calculate(_byte, multiple + 13);
                                        } else if(_byte <= multiplyRoot(81)) {
                                            obfuscated = calculate(_byte, multiple + 12);
                                        } else if(_byte <= multiplyRoot(82)) {
                                            obfuscated = calculate(_byte, multiple + 11);
                                        } else if(_byte <= multiplyRoot(83)) {
                                            obfuscated = calculate(_byte, multiple + 10);
                                        } else if(_byte <= multiplyRoot(84)) {
                                            obfuscated = calculate(_byte, multiple + 9);
                                        } else if(_byte <= multiplyRoot(85)) {
                                            obfuscated = calculate(_byte, multiple + 8);
                                        }
                                        byteObfuscated = rounder(obfuscated);
                                        _copyToMangle[i] = byteObfuscated;
                                    });
                                    return _copyToMangle;
                                };
                                var bytesEnumerable;
                                var byteChunks;
                                var hasher = function() {
                                    if(hash.length <= 0) {
                                        bytes = incoming;
                                        var fillerLeft = fillerBytes.slice(0, fillerBytes.length / 2);
                                        var fillerRight = fillerBytes.slice(fillerBytes.length / 2, fillerBytes.length);
                                        bytes = fillerLeft.concat(bytes);
                                        bytes = bytes.concat(fillerRight);
                                    } else {
                                        bytes = hash.slice(0);
                                    }
                                    hash.length = 0;
                                    chars = pro.serialization.string.getChars(bytes);
                                    bytes = pro.serialization.string.getBytes(chars);
                                    if(bytes.length > nBytes) {
                                        bytes = pro.collections.asEnumerable(bytes).take(nBytes).toArray();
                                    } else if(bytes.length < nBytes) {
                                        var masFiller = salt.slice(0);
                                        var masFillerBytes;
                                        var index = 1;
                                        do {
                                            masFiller = pro.string.scramble.calculated(masFiller, index < 5 ? index++ : 1);
                                            masFillerBytes = pro.serialization.string.getBytes(masFiller);
                                            bytes = bytes.concat(masFillerBytes);
                                        } while (bytes.length < nBytes);
                                        bytes = pro.collections.asEnumerable(bytes).take(nBytes).toArray();
                                    }
                                    bytes = mangleBytes(bytes);
                                    hash = hash.concat(bytes);
                                };
                                while(position < 10) {
                                    hasher();
                                    position++;
                                }
                            }
                            return hash;
                        } else if(pro.isString(arguments[0])) {
                            var string = arguments[0];
                            var bytes = pro.serialization.string.getBytes(string);
                            var hash = this.computeHash(bytes, arguments[1]);
                            return hash;
                        } else if(pro.isObject(arguments[0])) {
                            var object = arguments[0];
                            var json = pro.toJson(object);
                            return hash;
                            var bytes = pro.serialization.string.getBytes(json);
                            var hash = this.computeHash(bytes, arguments[1]);
                        } else {
                            return [];
                        }
                    } else if(arguments.length === 3 && pro.isString(arguments[0])) {
                        var key = arguments[0];
                        var keyBytes = pro.serialization.string.getBytes(key);
                        var incoming = arguments[1];
                        if(!pro.isString(incoming)) {
                            incoming = pro.toJson(incoming);
                        }
                        var incomingBytes = pro.serialization.string.getBytes(incoming);
                        var newBytes = keyBytes.concat(incomingBytes);
                        newBytes = pro.collections.array.scramble.calculated(newBytes, 5);
                        return pro.cryptography.exoHash.exoHasher.instance.computeHash(newBytes, arguments[2]);
                    }
                },
                compare: function(hash1, hash2) {
                    if(pro.isArray(hash1) && pro.isArray(hash2)) {
                        var strHash1 = pro.serialization.string.getString(hash1);
                        var strHash2 = pro.serialization.string.getString(hash2);
                        return pro.areEqual(strHash1, strHash2) ? 0 : -1;
                    } else if(pro.isString(hash1) && pro.isString(hash2)) {
                        return pro.areEqual(hash1, hash2) ? 0 : -1;
                    } else if(pro.getType(hash1) === pro.getType(hash2)) {
                        return pro.areEqual(hash1, hash2) ? 0 : -1;
                    }
                    return -1;
                }
            })
        })
    }));
    pro.cryptography.extend = pro.extend;
})(pro)
