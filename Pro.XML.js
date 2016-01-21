(function(pro) {
    pro.module('xml', pro.object({
        extend: pro.extend,
        exceptions: pro.object({
            invalidXmlException: pro.$class('pro.xml.exceptions.invalidXmlException', function() {
                this.initializeBase("The given XML was not valid and cannot be parsed by the xmlReader.", null);
            }, pro.exception)
        }),
        xmlDocument: pro.$class('pro.xml.xmlDocument', function() {
            this.schema = "";
            this.root = null;
            var children = new pro.collections.list();
            this.children = function(enumerable) {
                if(pro.isClass(enumerable) && enumerable.is(pro.collections.enumerable)) {
                    children = enumerable;
                } else {
                    return children;
                }
            };
            this.nodeCount = function() {
                return this.children().count() + (this.rootNode !== null ? 1 : 0);
            };
            this.sourceXml = "";
        }),
        xmlNode: pro.$class('pro.xml.xmlNode', function() {
            this.parent = null;
            this.document = null;
            this.innerXml = function() {
                var xml = "";
                var children = this.children();
                pro.collections.whileCanEnumerate(children, function(current) {
                    xml += current.sourceXml;
                });
                return xml;
            };
            this.outerXml = function() {
                //TODO: work on outerXml() function
                var innerXml = this.innerXml();
                var parents = this.parents().count() > 0 ? this.parents().reverse() : new pro.collections.list().add(this);
                var formats = new pro.collections.list();
                pro.collections.whileCanEnumerate(parents, function(p) {
                    var format = p.isContainerNode === true ? p.sourceXml + "{0}" + p.sourceXml.replace("<", "</") : p.sourceXml;
                    formats.add(format);
                });
                formats = formats.select(function(f) {
                    var i = formats.indexOf(f);
                    if(pro.isDefined(formats.atIndex(i + 1))) {
                        f = pro.stringFormatter(f, formats.atIndex(i + 1));
                    } else if(i === formats.count() - 1) {
                        f = pro.stringFormatter(f, innerXml);
                    }
                    return f;
                });
                console.log(formats.join(''));
            };
            this.sourceXml = "";
            this.value = "";
            var children = new pro.collections.list();
            this.children = function(enumerable) {
                if(pro.isClass(enumerable) && enumerable.is(pro.collections.enumerable)) {
                    children = enumerable;
                } else {
                    return children;
                }
            };
            this.attributes = new pro.collections.list();
            this.parents = function() {
                var p = new pro.collections.list();
                var node = this;
                while(pro.isDefined(node.parent)) {
                    p.add(node.parent);
                    node = node.parent;
                }
                return p;
            };
            this.name = "";
            this.namespace = "";
            this.isContainerNode = true;
            this.isRoot = false;
        }),
        xmlNodeAttribute: pro.$class('pro.xml.xmlNodeAttribute', function(name, value) {
            this.overrides = pro.object({
                key: 'key',
                value: 'value'
            });
            this.initializeBase(name, value);
            this.name = name;
            this.value = value;
        }, pro.keyValuePair),
        xmlReader: pro.$class('pro.xml.xmlReader', function(xml, config) {
            if(pro.isString(xml)) {
                var $this = this;
                var namespace = pro.isObject(config.namespace) ? config.namespace : null;
                var name = namespace !== null && pro.isString(namespace.name) ? namespace.name : null;
                var parent = pro.isString(config.parent) ? config.parent : null;
                var nodePairRegex = /^<[A-Za-z0-9:"+=!@#$%^&*()+=,.:;"'|\[\]\{\}\/_\- ]+>[A-Za-z0-9!@#$%^&*()+=.\/:;|\\'"\[\]\{\}<> _-]+<\/[A-Za-z0-9:"+=!@#$%^&*()+=,.:;"'|\[\]\{\}\/_\- ]+>$/i;
                var selfCloseRegex = /^<[A-Za-z0-9:"+=!@#$%^&*()+=,.:;"'|\[\]\{\}\/_\- ]+ \/>$/i;
                var valueSplitRegex = /<[A-Za-z0-9:"+= \/]+>/gmi;
                var openNodeRegex = /^<[A-Za-z0-9:"+=!@#$%^&*()+=,.:;"'|\[\]\{\}_\- ]+>$/i;
                var closeNodeRegex = /^<\/[A-Za-z0-9:"+=!@#$%^&*()+=,.:;"'|\[\]\{\}_\- ]+>$/i;
                var splitRegex = /\r\n/gmi;
                var schemaRegex = /<\?xml[A-Za-z0-9:+="\-. ]+\?>/gmi;
                var nodeSplit;
                if(splitRegex.test(xml) === false) {
                    var xmlCopy = xml.slice(0).replace(/></gmi, ">|::|<");
                    nodeSplit = xmlCopy.split("|::|");
                } else {
                    nodeSplit = xml.split(splitRegex);
                }
                var nodeEnumerable = pro.collections.asEnumerable(nodeSplit);
                var schemaInfo = nodeEnumerable.atIndex(0);
                schemaInfo = schemaRegex.test(schemaInfo) ? schemaInfo : '<?xml version="1.0" encoding="UTF-8"?>';
                var currentParent = null;
                var removals = nodeEnumerable.where(function(n) {
                    return n.length === 0 || n === "";
                });
                var parentNode = name !== null && parent !== null ? name + ":" + parent : null;
                var parents = nodeEnumerable.where(function(n) {
                    return n.indexOf(parentNode) > -1;
                });
                if(parentNode === null) {
                    parentNode = nodeEnumerable.atIndex(1);
                }
                var document = new pro.xml.xmlDocument();
                var parentLevels = new pro.collections.list();
                var rootNode = parents.first() || parentNode;
                var rootNodeMod = rootNode.replace("<", "").replace(">", "");
                rootNodeMod = rootNodeMod.indexOf(" ") > -1 ? rootNodeMod.split(' ')[0] : rootNodeMod;
                var rootNodeNameSplit = rootNodeMod.split(/:/g);
                var rootNodeNameSpace = rootNodeNameSplit.length === 2 ? rootNodeNameSplit[0] : null;
                var rootNodeName = rootNodeNameSpace !== null ? rootNodeNameSplit[1] : rootNodeNameSplit[0];
                var rootXNode = new pro.xml.xmlNode();
                rootNodeName = (/[ ]/gmi).test(rootNodeName) ? rootNodeName.split(' ')[0] : rootNodeName;
                rootXNode.parent = null;
                rootXNode.value = "";
                rootXNode.name = rootNodeName;
                rootXNode.namespace = rootNodeNameSpace;
                rootXNode.isRoot = true;
                rootXNode.document = document;
                rootXNode.sourceXml = rootNode;
                parentLevels.add(rootXNode);
                nodeEnumerable = nodeEnumerable.remove(schemaInfo).removeRange(removals).removeRange(parents).select(function(n) {
                    return n.trim()
                });
                this.read = function() {
                    document.root = rootXNode;
                    document.sourceXml = xml;
                    document.schema = schemaInfo;
                    nodeEnumerable.forEach(function(i, n) {
                        currentParent = parentLevels.last();
                        var xNode = new pro.xml.xmlNode();
                        xNode.parent = currentParent;
                        xNode.document = document;
                        xNode.sourceXml = n;
                        if(nodePairRegex.test(n)) {
                            var valueSplit = n.split(valueSplitRegex);
                            var value = valueSplit[1];
                            var nodeSplit = n.split('>');
                            var openNode = nodeSplit[0];
                            var nodeMod = openNode.replace("<", "").replace(">", "");
                            var nodeNameSplit = nodeMod.split(":");
                            var namespace = nodeNameSplit.length === 2 ? nodeNameSplit[0] : null;
                            var name = namespace !== null ? nodeNameSplit[1] : nodeNameSplit[0];
                            xNode.namespace = namespace;
                            xNode.name = name;
                            xNode.value = value;
                            xNode.isContainerNode = false;
                        } else if(selfCloseRegex.test(n)) {
                            var nodeMod = n.replace("<", "").replace("/>", "");
                            var nodeNameSplit = nodeMod.split(":");
                            var namespace = nodeNameSplit.length === 2 ? nodeNameSplit[0] : null;
                            var name = namespace !== null ? nodeNameSplit[1] : nodeNameSplit[0];
                            var nameSplit = name.split(" ");
                            var nameSplitEnumerable = pro.collections.asEnumerable(nameSplit).where(function(str) {
                                return str.indexOf("=") > -1;
                            });
                            nameSplitEnumerable.forEach(function(i, str) {
                                var kvp = str.split("=");
                                var key = kvp[0];
                                var value = kvp[1];
                                xNode.attributes.add(new pro.xml.xmlNodeAttribute(key, value));
                            });
                            name = name.indexOf("nil") > -1 || name.indexOf(" ") > -1 ? name.split(" ")[0].trim() : name;
                            xNode.namespace = namespace;
                            xNode.name = name;
                            xNode.value = null;
                            xNode.isContainerNode = false;
                        } else if(openNodeRegex.test(n)) {
                            var nodeMod = n.replace("<", "").replace(">", "");
                            var nodeNameSplit = nodeMod.split(":");
                            var namespace = nodeNameSplit.length === 2 ? nodeNameSplit[0] : null;
                            var name = namespace !== null ? nodeNameSplit[1] : nodeNameSplit[0];
                            xNode.namespace = namespace;
                            xNode.name = name;
                            xNode.value = "";
                            parentLevels.add(xNode);
                        } else if(closeNodeRegex.test(n)) {
                            xNode = null;
                            parentLevels.remove(parentLevels.last());
                        }
                        if(xNode !== null) {
                            if(parentLevels.count() > 0) {
                                parentLevels.forEach(function(i, p) {
                                    if(xNode !== p) {
                                        p.children().add(xNode);
                                    }
                                });
                            }
                            document.children().add(xNode);
                        }
                    });
                    document.children(pro.collections.asEnumerable(document.children()).toList());
                    return document;
                };
            } else {
                throw new pro.xml.exceptions.invalidXmlException();
            }
        })
    }));
})(pro);
