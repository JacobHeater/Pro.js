/****************************************************************************
 *****************************************************************************
 *****************************************************************************{
Summary: Pro.Entities.JS - An extension of the Pro.JS library that offers
a high-level API for creating a relational mapping of entities.
Author: Jacob Heater,
Dependencies: 1. Pro.js, 2. pro.Collection.js,
Questions/Comments: jacobheater@gmail.com,
License: Open Source under MIT License @ https://github.com/JacobHeater/Pro.js/blob/Version-2.0/LICENSE,
Version: 2.0
}
 ****************************************************************************
 *****************************************************************************
 *****************************************************************************/
define('pro.entities', ['pro', 'pro.collections'], function (pro, collections) {
    "use strict";
    pro.module('entities', pro.object({
        extend: pro.extend,
        contextCache: new collections.dictionary(),
        dataTypes: pro.object({
            string: 'string',
            number: 'number',
            bit: 'boolean',
            object: 'object',
            guid: 'guid'
        }),
        model: pro.$class('pro.entities.model', function (name) {
            if (!pro.isString(name)) {
                throw new Error('Argument: name is invalid. The model name must be a valid string.');
            } else if (pro.isString(name)) {
                if (name.trim().length <= 0) {
                    throw new Error(pro.stringFormatter("Argument: name is invalid. The model name must be a valid string of a length greater than {0} and must not be empty.", name.trim().length));
                }
                if (pro.entities.contextCache.containsKey(name)) {
                    throw new Error(pro.stringFormatter("Argument: name is invalid for this model. There is already a model that exists with name '{0}', and creating this model would overwrite the existing model.", name));
                }
            }
            var _model = this;
            var entities = new collections.dictionary();
            var onFnInvoke = function () {
                entities.forEach(function (i, kvp) {
                    _model.entities[kvp.key] = kvp.value;
                });
            };
            this.name = name;
            this.entities = pro.object({
                add: function (entity) {
                    if (pro.isClass(entity) && entity.is(pro.entities.entity)) {
                        entity.model = _model;
                        entities.add(entity.name, entity);
                        onFnInvoke();
                    } else {
                        throw new Error("Argument: entity must be an instance of type pro.entities.entity to add it to the model.");
                    }
                    return this;
                },
                remove: function (name) {
                    entities.remove(name);
                    onFnInvoke();
                    return this;
                }
            });
            this.query = function (name, filter) {
                var result = new collections.enumerable([]);
                if (pro.isDefined(this.entities[name])) {
                    if (pro.isFunction(filter)) {
                        result = this.entities[name].where(filter);
                    } else {
                        result = this.entities[name];
                    }
                }
                return new pro.entities.queryResult(_model, name, result, false);
            };
            pro.entities.contextCache.add(this.name, this);
        }),
        dataSet: pro.$class('pro.entities.dataSet << pro.collection.enumerable', function (entity, data, onDataSetChange) {
            var _dataSet = this;
            var _onDataSetChange = onDataSetChange || function () { };
            this.overrides = pro.object({
                remove: 'remove'
            });
            this.onDataSetChange = function (event) {
                if (pro.isFunction(event)) {
                    _onDataSetChange = event;
                }
            };
            this.initializeBase(data || []);
            if (pro.isClass(entity) && entity.is(pro.entities.entity)) {
                var dataList = new collections.list(data || []);
                var onFnInvoke = function () {
                    _dataSet.initializeBase(dataList);
                    _onDataSetChange.call(_dataSet, _dataSet);
                };
                var incrementIdentity = function (column, value) {
                    var output = value;
                    if (column.isIdentity === true && pro.isDefined(output)) {
                        if (pro.getType(output) === pro.entities.dataTypes.number) {
                            if (dataList.count() > 0) {
                                output = dataList.last()[column.name] + 1;
                            } else {
                                output++;
                            }
                        }
                    }
                    return output;
                };
                var validateRelationships = function (column, relationships, value) {
                    var valid = true;
                    if (pro.isDefined(relationships)) {
                        var rel = null;
                        pro.enumerateObject(relationships, function (key, value) {
                            if (value.leftEntity && value.leftEntity.column === column.name) {
                                rel = value;
                            }
                        });
                        if (pro.isDefined(rel)) {
                            var relatable = rel.rightEntity;
                            var name = relatable.name;
                            var column = relatable.column;
                            var model = _dataSet.entity.model;
                            var result = model.query(name, function (item) {
                                return item[column] === value;
                            }).first();
                            if (!pro.isDefined(result)) {
                                throw new Error(pro.stringFormatter('Relationship is not valid for table name {0} and column {1} with value {2}. The record does not exist in table {0}.', name, column, value));
                            }
                        }
                    }
                    return valid;
                };
                this.entity = entity;
                this.add = function (entry) {
                    var record = pro.object();
                    var i = 0;
                    if (pro.isObject(entry) && pro.propCount(entry) <= this.entity.columnCount) {
                        pro.enumerateObject(this.entity.columns, function (key, value) {
                            if (validateRelationships(value, _dataSet.entity.relationships, entry[value.name])) {
                                if (pro.isDefined(entry[value.name])) {
                                    record[value.name] = incrementIdentity(value, entry[value.name]);
                                }
                            }
                        });
                    } else if (pro.isArray(entry) && entry.length <= this.entity.columnCount) {
                        pro.enumerateObject(this.entity.columns, function (key, value) {
                            if (validateRelationships(entry[i])) {
                                if (pro.isDefined(entry[i])) {
                                    record[value.name] = incrementIdentity(entry[i]);
                                }
                                i++;
                            }
                        });
                    } else if (arguments.length > 1 && arguments.length <= this.entity.columnCount) {
                        var _args = arguments;
                        pro.enumerateObject(this.entity.columns, function (key, value) {
                            if (validateRelationships(_args[i])) {
                                if (pro.isDefined(_args[i])) {
                                    record[value.name] = incrementIdentity(_args[i]);
                                }
                            }
                        });
                    }
                    if (pro.propCount(record) === this.entity.columnCount) {
                        dataList.add(record);
                        onFnInvoke();
                    }
                    return this;
                };
                this.delete = function (entry) {
                    //TODO: Verify FK relationships before deleting for any dependencies.
                    if (dataList.contains(entry)) {
                        dataList.remove(entry);
                        onFnInvoke();
                    }
                    return this;
                };
            } else {
                throw new Error('Argument: entity must not be null and must be an instance of pro.entities.entity to establish a relationship between a dataset and an entity.');
            }
        }, collections.enumerable)
    }));
    pro.extend(pro.entities, pro.object({
        entity: pro.$class('pro.entities.entity', function (name, configuration) {
            var _entity = this;
            var _onDataSetChange = function (b) {
                _entity.initializeBase(_entity, this.toArray());
                _entity.base.onDataSetChange(_onDataSetChange);
            };
            if (pro.isObject(configuration)) {
                if (configuration.columns) {
                    this.columns = pro.extend({}, configuration.columns);
                    this.columnCount = pro.propCount(this.columns);
                    this.identityColumn = null;
                    pro.enumerateObject(this.columns, function (key, value) {
                        if (value.isIdentity === true) {
                            _entity.identityColumn = value;
                        }
                    });
                }
                if (configuration.relationships) {
                    this.relationships = pro.extend({}, configuration.relationships);
                }
            }
            this.name = name;
            this.overrides = pro.object({
                remove: 'remove'
            });
            this.initializeBase(this, []);
            this.base.onDataSetChange(_onDataSetChange);
        }, pro.entities.dataSet),
        column: pro.$class('pro.entities.column', function (isIdentity, name, dataType) {
            this.dataType = dataType;
            this.name = name;
            this.isIdentity = isIdentity;
        }),
        relationship: pro.$class('pro.entities.realtionship', function (leftEntity, rightEntity) {
            if (pro.isObject(leftEntity) && pro.isObject(rightEntity) && leftEntity.name && leftEntity.column && rightEntity.name && rightEntity.column) {
                this.leftEntity = pro.object({
                    name: leftEntity.name,
                    column: leftEntity.column
                });
                this.rightEntity = pro.object({
                    name: rightEntity.name,
                    column: rightEntity.column
                });
            }
        }),
        queryResult: pro.$class('pro.entities.queryResult << collections.enumerable', function (model, entityName, data, joined) {
            if (!pro.isString(entityName)) {
                throw new Error('Argument: entityName is not valid. entityName must be a valid string.');
            } else if (pro.isString(entityName)) {
                if (entityName.trim().length <= 0) {
                    throw new Error('Argument: entityName cannot be an empty string.');
                }
            }
            if (!pro.isDefined(model) || !pro.isClass(model) || (pro.isClass(model) && !model.is(pro.entities.model))) {
                throw new Error('Argument: model must be an instance of pro.entities.model.');
            }
            var _queryResult = this;
            this.overrides = pro.object({
                remove: 'remove'
            });
            this.initializeBase(data || []);
            this.joined = pro.isBoolean(joined) ? joined : false;
            this.toDataset = function () {
                return new pro.entities.dataSet(model.entities[entityName], this.toArray());
            };
            this.join = function (entityName, joiner) {
                if (!pro.isString(entityName) || (pro.isString(entityName) && entityName.trim().length <= 0)) {
                    throw new Error('Argument: entityName must be a valid string that is not empty.');
                }
                if (!pro.isFunction(joiner)) {
                    throw new Error('Argument: joiner must be a function in order to properly join the two collections.');
                }
                var _joiner = pro.isFunction(joiner) ? joiner : function () { };
                var innerResult = this.model.query(entityName);
                var resultSet = new collections.list();
                this.forEach(function (li, left) {
                    innerResult.forEach(function (ri, right) {
                        var matches = joiner(left, right);
                        if (matches === true) {
                            //Must create a new object to ensure that the model doesn't get corrupted.
                            var compositeRecord = pro.extend({}, left);
                            compositeRecord[entityName] = right;
                            resultSet.add(compositeRecord);
                        }
                    });
                });
                return new pro.entities.queryResult(_queryResult.model, pro.stringFormatter('{0} <= {1}', _queryResult.entityName, entityName), resultSet, true);
            };
            this.entityName = entityName;
            this.model = model;
        }, collections.enumerable)
    }));
    return pro.entities;
});
