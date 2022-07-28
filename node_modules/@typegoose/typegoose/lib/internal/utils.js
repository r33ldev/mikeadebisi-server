"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toStringNoFail = exports.warnNotCorrectTypeOptions = exports.isConstructor = exports.getType = exports.assertionIsClass = exports.assertion = exports.createArrayFromDimensions = exports.assignGlobalModelOptions = exports.isNullOrUndefined = exports.warnMixed = exports.isTypeMeantToBeArray = exports.mapOptions = exports.mapArrayOptions = exports.isNotDefined = exports.getName = exports.getRightTarget = exports.mergeSchemaOptions = exports.mergeMetadata = exports.assignMetadata = exports.includesAllVirtualPOP = exports.allVirtualoptions = exports.isWithVirtualPOP = exports.isWithEnumValidate = exports.isWithNumberValidate = exports.isWithStringTransform = exports.isWithStringValidate = exports.getClass = exports.getClassForDocument = exports.initProperty = exports.isString = exports.isNumber = exports.isObject = exports.isAnRefType = exports.isPrimitive = void 0;
const lodash_1 = require("lodash");
const mongoose = require("mongoose");
const logSettings_1 = require("../logSettings");
const constants_1 = require("./constants");
const data_1 = require("./data");
const errors_1 = require("./errors");
/**
 * Returns true, if the type is included in mongoose.Schema.Types
 * @param Type The Type to test
 * @returns true, if it includes it
 */
function isPrimitive(Type) {
    if (typeof (Type === null || Type === void 0 ? void 0 : Type.name) === 'string') {
        // try to match "Type.name" with all the Property Names of "mongoose.Schema.Types"
        // (like "String" with "mongoose.Schema.Types.String")
        return (Object.getOwnPropertyNames(mongoose.Schema.Types).includes(Type.name) ||
            // try to match "Type.name" with all "mongoose.Schema.Types.*.name"
            // (like "SchemaString" with "mongoose.Schema.Types.String.name")
            Object.values(mongoose.Schema.Types).findIndex((v) => v.name === Type.name) >= 0);
    }
    return false;
}
exports.isPrimitive = isPrimitive;
/**
 * Returns true, if the type is included in mongoose.Schema.Types except the aliases
 * @param Type The Type to test
 * @returns true, if it includes it
 */
function isAnRefType(Type) {
    if (typeof (Type === null || Type === void 0 ? void 0 : Type.name) === 'string') {
        // Note: this is not done "once" because types can be added as custom types
        const tmp = Object.getOwnPropertyNames(mongoose.Schema.Types).filter((x) => {
            switch (x) {
                case 'Oid':
                case 'Bool':
                case 'Object':
                case 'Boolean':
                    return false;
                default:
                    return true;
            }
        });
        // try to match "Type.name" with all the Property Names of "mongoose.Schema.Types" except the ones with aliases
        // (like "String" with "mongoose.Schema.Types.String")
        return (tmp.includes(Type.name) ||
            // try to match "Type.name" with all "mongoose.Schema.Types.*.name"
            // (like "SchemaString" with "mongoose.Schema.Types.String.name")
            Object.values(mongoose.Schema.Types).findIndex((v) => v.name === Type.name) >= 0);
    }
    return false;
}
exports.isAnRefType = isAnRefType;
/**
 * Returns true, if it is an Object
 * Looks down the prototype chain, unless "once" is set to "true"
 * @param Type The Type to test
 * @param once Set to not loop down the prototype chain, default "false"
 * @returns true, if it is an Object
 */
function isObject(Type, once = false) {
    if (typeof (Type === null || Type === void 0 ? void 0 : Type.name) === 'string') {
        let prototype = Type.prototype;
        let name = Type.name;
        while (name) {
            if (name === 'Object' || name === 'Mixed') {
                return true;
            }
            if (once) {
                break;
            }
            prototype = Object.getPrototypeOf(prototype);
            name = prototype === null || prototype === void 0 ? void 0 : prototype.constructor.name;
        }
    }
    return false;
}
exports.isObject = isObject;
/**
 * Returns true, if it is an Number
 * @param Type The Type to test
 * @returns true, if it is an Number
 */
function isNumber(Type) {
    var _a;
    const name = (_a = Type === null || Type === void 0 ? void 0 : Type.name) !== null && _a !== void 0 ? _a : '';
    return name === 'Number' || name === mongoose.Schema.Types.Number.name;
}
exports.isNumber = isNumber;
/**
 * Returns true, if it is an String
 * @param Type The Type to test
 * @returns true, if it is an String
 */
function isString(Type) {
    var _a;
    const name = (_a = Type === null || Type === void 0 ? void 0 : Type.name) !== null && _a !== void 0 ? _a : '';
    return name === 'String' || name === mongoose.Schema.Types.String.name;
}
exports.isString = isString;
/**
 * Generate the inital values for the property to be extended upon
 * @param name Name of the current Model/Class
 * @param key Key of the property
 * @param proptype Type of the Property
 */
function initProperty(name, key, proptype) {
    const schemaProp = !data_1.schemas.has(name) ? data_1.schemas.set(name, {}).get(name) : data_1.schemas.get(name);
    switch (proptype) {
        case constants_1.PropType.ARRAY:
            schemaProp[key] = [{}];
            break;
        case constants_1.PropType.MAP:
        case constants_1.PropType.NONE:
            schemaProp[key] = {};
            break;
        default:
            throw new errors_1.InvalidPropTypeError(proptype, name, key, 'PropType(initProperty)');
    }
    return schemaProp;
}
exports.initProperty = initProperty;
/**
 * Get the Class for a given Document
 * @param document The Document to fetch the class from
 */
function getClassForDocument(document) {
    const modelName = document.constructor.modelName;
    return data_1.constructors.get(modelName);
}
exports.getClassForDocument = getClassForDocument;
/**
 * Get the Class for a number of inputs
 * @param input The Input to fetch the class from
 */
function getClass(input) {
    if (typeof input === 'string') {
        return data_1.constructors.get(input);
    }
    if (typeof (input === null || input === void 0 ? void 0 : input.typegooseName) === 'string') {
        return data_1.constructors.get(input.typegooseName);
    }
    if (typeof (input === null || input === void 0 ? void 0 : input.typegooseName) === 'function') {
        return data_1.constructors.get(input.typegooseName());
    }
    throw new errors_1.ResolveTypegooseNameError(input);
}
exports.getClass = getClass;
/**
 * Returns all options found in "options" that are String-validate related
 * @param options The raw Options that may contain the wanted options
 */
function isWithStringValidate(options) {
    return (0, lodash_1.intersection)(Object.keys(options), ['match', 'minlength', 'maxlength']);
}
exports.isWithStringValidate = isWithStringValidate;
/**
 * Returns all options found in "options" that are String-transform related
 * @param options The raw Options
 */
function isWithStringTransform(options) {
    return (0, lodash_1.intersection)(Object.keys(options), ['lowercase', 'uppercase', 'trim']);
}
exports.isWithStringTransform = isWithStringTransform;
/**
 * Returns all options found in "options" that are Number-Validate related
 * @param options The raw Options
 */
function isWithNumberValidate(options) {
    return (0, lodash_1.intersection)(Object.keys(options), ['min', 'max']);
}
exports.isWithNumberValidate = isWithNumberValidate;
/**
 * Returns all options found in "options" that are Enum Related
 * @param options The raw Options
 */
function isWithEnumValidate(options) {
    return (0, lodash_1.intersection)(Object.keys(options), ['enum']);
}
exports.isWithEnumValidate = isWithEnumValidate;
const virtualOptions = ['localField', 'foreignField'];
/**
 * Check if the "options" contain any Virtual-Populate related options (excluding "ref" by it self)
 * @param options The raw Options
 */
function isWithVirtualPOP(options) {
    return Object.keys(options).some((v) => virtualOptions.includes(v));
}
exports.isWithVirtualPOP = isWithVirtualPOP;
exports.allVirtualoptions = virtualOptions.slice(0); // copy "virtualOptions" array
exports.allVirtualoptions.push('ref');
/**
 * Check if all Required options for Virtual-Populate are included in "options"
 * @param options The raw Options
 */
function includesAllVirtualPOP(options) {
    return exports.allVirtualoptions.every((v) => Object.keys(options).includes(v));
}
exports.includesAllVirtualPOP = includesAllVirtualPOP;
/**
 * Merge "value" with existing Metadata and save it to the class
 * Difference with "mergeMetadata" is that this one DOES save it to the class
 * Overwrites any existing Metadata that is new in "value"
 * @param key Metadata key to read from and assign the new value to
 * @param value Options to merge with
 * @param cl The Class to read and assign the new metadata to
 * @internal
 */
function assignMetadata(key, value, cl) {
    if (isNullOrUndefined(value)) {
        return value;
    }
    const newValue = mergeMetadata(key, value, cl);
    Reflect.defineMetadata(key, newValue, cl);
    return newValue;
}
exports.assignMetadata = assignMetadata;
/**
 * Merge "value" with existing Metadata
 * Difference with "assignMetadata" is that this one DOES NOT save it to the class
 * Overwrites any existing Metadata that is new in "value"
 * @param key Metadata key to read existing metadata from
 * @param value Option to merge with
 * @param cl The Class to read the metadata from
 * @returns Returns the merged output, where "value" overwrites existing Metadata values
 * @internal
 */
function mergeMetadata(key, value, cl) {
    assertion(typeof key === 'string' && key.length > 0, () => new errors_1.StringLengthExpectedError(1, key, getName(cl), 'key'));
    assertionIsClass(cl);
    // Please don't remove the other values from the function, even when unused - it is made to be clear what is what
    return (0, lodash_1.mergeWith)({}, Reflect.getMetadata(key, cl), value, (_objValue, srcValue, ckey) => customMerger(ckey, srcValue));
}
exports.mergeMetadata = mergeMetadata;
/**
 * Used for lodash customizer's (cloneWith, cloneDeepWith, mergeWith)
 * @param key the key of the current object
 * @param val the value of the object that should get returned for "existingMongoose" & "existingConnection"
 */
function customMerger(key, val) {
    if (typeof key !== 'string') {
        return undefined;
    }
    if (/^(existingMongoose|existingConnection)$/.test(key)) {
        return val;
    }
    return undefined;
}
/**
 * Merge only schemaOptions from ModelOptions of the class
 * @param value The value to use
 * @param cl The Class to get the values from
 */
function mergeSchemaOptions(value, cl) {
    return mergeMetadata(constants_1.DecoratorKeys.ModelOptions, { schemaOptions: value }, cl).schemaOptions;
}
exports.mergeSchemaOptions = mergeSchemaOptions;
/**
 * Tries to return the right target
 * if target.constructor.name is "Function", return "target", otherwise "target.constructor"
 * @param target The target to determine
 */
function getRightTarget(target) {
    var _a;
    return ((_a = target.constructor) === null || _a === void 0 ? void 0 : _a.name) === 'Function' ? target : target.constructor;
}
exports.getRightTarget = getRightTarget;
/**
 * Get the Class's final name
 * (combines all available options to generate a name)
 * @param cl The Class to get the name for
 * @param overwriteOptions Overwrite ModelOptions to generate a name from (Only name related options are merged)
 */
function getName(cl, overwriteOptions) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    // this case (cl being undefined / null) can happen when type casting (or type being "any") happened and wanting to throw a Error (and there using "getName" to help)
    // check if input variable is undefined, if it is throw a error (cannot be combined with the error below because of "getRightTarget")
    assertion(!isNullOrUndefined(cl), () => new errors_1.NoValidClassError(cl));
    const ctor = getRightTarget(cl);
    assertion(isConstructor(ctor), () => new errors_1.NoValidClassError(ctor));
    const options = (_a = Reflect.getMetadata(constants_1.DecoratorKeys.ModelOptions, ctor)) !== null && _a !== void 0 ? _a : {};
    const baseName = ctor.name;
    const customName = (_c = (_b = overwriteOptions === null || overwriteOptions === void 0 ? void 0 : overwriteOptions.options) === null || _b === void 0 ? void 0 : _b.customName) !== null && _c !== void 0 ? _c : (_d = options.options) === null || _d === void 0 ? void 0 : _d.customName;
    if (typeof customName === 'function') {
        const name = customName(options);
        assertion(typeof name === 'string' && name.length > 0, () => new errors_1.StringLengthExpectedError(1, name, baseName, 'options.customName(function)'));
        return name;
    }
    const automaticName = (_f = (_e = overwriteOptions === null || overwriteOptions === void 0 ? void 0 : overwriteOptions.options) === null || _e === void 0 ? void 0 : _e.automaticName) !== null && _f !== void 0 ? _f : (_g = options.options) === null || _g === void 0 ? void 0 : _g.automaticName;
    if (automaticName) {
        const suffix = (_j = customName !== null && customName !== void 0 ? customName : (_h = overwriteOptions === null || overwriteOptions === void 0 ? void 0 : overwriteOptions.schemaOptions) === null || _h === void 0 ? void 0 : _h.collection) !== null && _j !== void 0 ? _j : (_k = options.schemaOptions) === null || _k === void 0 ? void 0 : _k.collection;
        return !isNullOrUndefined(suffix) ? `${baseName}_${suffix}` : baseName;
    }
    if (isNullOrUndefined(customName)) {
        return baseName;
    }
    assertion(typeof customName === 'string' && customName.length > 0, () => new errors_1.StringLengthExpectedError(1, customName, baseName, 'options.customName'));
    return customName;
}
exports.getName = getName;
/**
 * Check if "Type" is a class and if it is already in "schemas"
 * @param Type The Type to check
 */
function isNotDefined(Type) {
    return typeof Type === 'function' && !isPrimitive(Type) && Type !== Object && !data_1.schemas.has(getName(Type));
}
exports.isNotDefined = isNotDefined;
/**
 * Map Options to "inner" & "outer"
 * -> inner: means inner of "type: [{here})"
 * -> outer: means outer of "type: [{}], here"
 *
 * Specific to Arrays
 * @param rawOptions The raw options
 * @param Type The Type of the array
 * @param target The Target class
 * @param pkey Key of the Property
 * @param loggerType Type to use for logging
 * @param extraInner Extra Options to Mad explicitly to "inner"
 */
function mapArrayOptions(rawOptions, Type, target, pkey, loggerType, extraInner) {
    logSettings_1.logger.debug('mapArrayOptions called');
    loggerType = loggerType !== null && loggerType !== void 0 ? loggerType : Type;
    if (!(Type instanceof mongoose.Schema)) {
        loggerType = Type;
    }
    const dim = rawOptions.dim; // needed, otherwise it will be included (and not removed) in the returnObject
    delete rawOptions.dim;
    const mapped = mapOptions(rawOptions, Type, target, pkey, loggerType);
    /** The Object that gets returned */
    const returnObject = Object.assign(Object.assign({}, mapped.outer), { type: [
            Object.assign(Object.assign({ type: Type }, mapped.inner), extraInner),
        ] });
    rawOptions.dim = dim; // re-add for "createArrayFromDimensions"
    returnObject.type = createArrayFromDimensions(rawOptions, returnObject.type, getName(target), pkey);
    if (loggerType) {
        logSettings_1.logger.debug('(Array) Final mapped Options for Type "%s"', getName(loggerType), returnObject);
    }
    return returnObject;
}
exports.mapArrayOptions = mapArrayOptions;
/**
 * Map Options to "inner" & "outer"
 * @param rawOptions The raw options
 * @param Type The Type of the array
 * @param target The Target class
 * @param pkey Key of the Property
 * @param loggerType Type to use for logging
 */
function mapOptions(rawOptions, Type, target, pkey, loggerType) {
    var _a;
    logSettings_1.logger.debug('mapOptions called');
    loggerType = loggerType !== null && loggerType !== void 0 ? loggerType : Type;
    /** The Object that gets returned */
    const ret = {
        inner: {},
        outer: {},
    };
    // if Type is not a Schema, try to convert js type to mongoose type (Object => Mixed)
    if (!(Type instanceof mongoose.Schema)) {
        // set the loggerType to the js type
        loggerType = Type;
        const loggerTypeName = getName(loggerType);
        if (loggerTypeName in mongoose.Schema.Types) {
            logSettings_1.logger.info('Converting "%s" to mongoose Type', loggerTypeName);
            Type = mongoose.Schema.Types[loggerTypeName];
            if (Type === mongoose.Schema.Types.Mixed) {
                warnMixed(target, pkey);
            }
        }
    }
    if (isNullOrUndefined(loggerType)) {
        logSettings_1.logger.info('mapOptions loggerType is undefined!');
    }
    /** The OptionsConstructor to use */
    let OptionsCTOR = (_a = Type === null || Type === void 0 ? void 0 : Type.prototype) === null || _a === void 0 ? void 0 : _a.OptionsConstructor;
    if (Type instanceof mongoose.Schema) {
        OptionsCTOR = mongoose.Schema.Types.Subdocument.prototype.OptionsConstructor;
    }
    assertion(!isNullOrUndefined(OptionsCTOR), () => new errors_1.InvalidOptionsConstructorError(getName(target), pkey, loggerType));
    const options = Object.assign({}, rawOptions); // for sanity
    if (OptionsCTOR.prototype instanceof mongoose.SchemaTypeOptions) {
        for (const [key, value] of Object.entries(options)) {
            if (Object.getOwnPropertyNames(OptionsCTOR.prototype).includes(key)) {
                ret.inner[key] = value;
            }
            else {
                ret.outer[key] = value;
            }
        }
    }
    else {
        if (loggerType) {
            logSettings_1.logger.info('The Type "%s" has a property "OptionsConstructor" but it does not extend "SchemaTypeOptions"', getName(loggerType));
        }
        ret.outer = options;
    }
    if (typeof (options === null || options === void 0 ? void 0 : options.innerOptions) === 'object') {
        delete ret.outer.innerOptions;
        for (const [key, value] of Object.entries(options.innerOptions)) {
            ret.inner[key] = value;
        }
    }
    if (typeof (options === null || options === void 0 ? void 0 : options.outerOptions) === 'object') {
        delete ret.outer.outerOptions;
        for (const [key, value] of Object.entries(options.outerOptions)) {
            ret.outer[key] = value;
        }
    }
    if (loggerType) {
        logSettings_1.logger.debug('Final mapped Options for Type "%s"', getName(loggerType), ret);
    }
    return ret;
}
exports.mapOptions = mapOptions;
/**
 * Check if the current Type is meant to be a Array
 * @param rawOptions The raw options
 */
function isTypeMeantToBeArray(rawOptions) {
    // check if the "dim" option exists, if yes the type is meant to be a array in the end
    return !isNullOrUndefined(rawOptions) && !isNullOrUndefined(rawOptions.dim) && typeof rawOptions.dim === 'number' && rawOptions.dim > 0;
}
exports.isTypeMeantToBeArray = isTypeMeantToBeArray;
/**
 * Warn, Error or Allow if an mixed type is set
 * -> this function exists for de-duplication
 * @param target Target Class
 * @param key Property key
 */
function warnMixed(target, key) {
    var _a, _b, _c, _d, _e, _f;
    const name = getName(target);
    const modelOptions = (_a = Reflect.getMetadata(constants_1.DecoratorKeys.ModelOptions, getRightTarget(target))) !== null && _a !== void 0 ? _a : {};
    const rawOptions = Reflect.getMetadata(constants_1.DecoratorKeys.PropCache, target);
    const setSeverity = (_f = (_d = (_c = (_b = rawOptions === null || rawOptions === void 0 ? void 0 : rawOptions.get(key)) === null || _b === void 0 ? void 0 : _b.options) === null || _c === void 0 ? void 0 : _c.allowMixed) !== null && _d !== void 0 ? _d : (_e = modelOptions.options) === null || _e === void 0 ? void 0 : _e.allowMixed) !== null && _f !== void 0 ? _f : constants_1.Severity.WARN;
    logSettings_1.logger.debug(`setSeverity for "${name}.${key}" is "${setSeverity}"`);
    switch (setSeverity) {
        default:
        case constants_1.Severity.WARN:
            logSettings_1.logger.warn('Setting "Mixed" for property "%s.%s"\nLook here for how to disable this message: https://typegoose.github.io/typegoose/docs/api/decorators/model-options/#allowmixed', name, key);
            break;
        case constants_1.Severity.ALLOW:
            break;
        case constants_1.Severity.ERROR:
            throw new TypeError(`Setting "Mixed" is not allowed! (${name}, ${key}) [E017]`);
    }
    return; // always return, if "allowMixed" is not "ERROR"
}
exports.warnMixed = warnMixed;
/**
 * Check if "val" is "null" to "undefined"
 * This Function exists because since node 4.0.0 the internal util.is* functions got deprecated
 * @param val Any value to test if null or undefined
 */
function isNullOrUndefined(val) {
    return val === null || val === undefined;
}
exports.isNullOrUndefined = isNullOrUndefined;
/**
 * Assign Global ModelOptions if not already existing
 * @param target Target Class
 */
function assignGlobalModelOptions(target) {
    if (isNullOrUndefined(Reflect.getMetadata(constants_1.DecoratorKeys.ModelOptions, target))) {
        logSettings_1.logger.info('Assigning global Schema Options to "%s"', getName(target));
        assignMetadata(constants_1.DecoratorKeys.ModelOptions, (0, lodash_1.omit)(data_1.globalOptions, 'globalOptions'), target);
    }
}
exports.assignGlobalModelOptions = assignGlobalModelOptions;
/**
 * Loop over "dimensions" and create an array from that
 * @param rawOptions baseProp's rawOptions
 * @param extra What is actually in the deepest array
 * @param name name of the target for better error logging
 * @param key key of target-key for better error logging
 */
function createArrayFromDimensions(rawOptions, extra, name, key) {
    // dimensions start at 1 (not 0)
    const dim = typeof rawOptions.dim === 'number' ? rawOptions.dim : 1;
    if (dim < 1) {
        throw new RangeError(`"dim" needs to be higher than 0 (${name}.${key}) [E018]`);
    }
    delete rawOptions.dim; // delete this property to not actually put it as an option
    logSettings_1.logger.info('createArrayFromDimensions called with %d dimensions', dim);
    let retArray = Array.isArray(extra) ? extra : [extra];
    // index starts at 1 because "retArray" is already once wrapped in an array
    for (let index = 1; index < dim; index++) {
        retArray = [retArray];
    }
    return retArray;
}
exports.createArrayFromDimensions = createArrayFromDimensions;
/**
 * Assert a condition, if "false" throw error
 * Note: it is not named "assert" to differentiate between node and jest types
 *
 * Note: "error" can be a function to not execute the constructor when not needed
 * @param cond The Condition to check
 * @param error A Custom Error to throw or a function that returns a Error
 */
function assertion(cond, error) {
    if (!cond) {
        throw typeof error === 'function' ? error() : error !== null && error !== void 0 ? error : new errors_1.AssertionFallbackError();
    }
}
exports.assertion = assertion;
/**
 * Assert if "val" is an function (constructor for classes)
 * @param val Value to test
 */
function assertionIsClass(val) {
    assertion(isConstructor(val), () => new errors_1.NoValidClassError(val));
}
exports.assertionIsClass = assertionIsClass;
/**
 * Get Type, if input is an arrow-function, execute it and return the result
 * @param typeOrFunc Function or Type
 * @param returnLastFoundArray Return the last found array (used for something like PropOptions.discriminators)
 */
function getType(typeOrFunc, returnLastFoundArray = false) {
    const returnObject = {
        type: typeOrFunc,
        dim: 0,
    };
    if (typeof returnObject.type === 'function' && !isConstructor(returnObject.type)) {
        returnObject.type = returnObject.type();
    }
    function getDepth() {
        if (returnObject.dim > 100) {
            // this is arbitrary, but why would anyone have more than 10 nested arrays anyway?
            throw new Error('getDepth recursed too much (dim > 100)');
        }
        if (Array.isArray(returnObject.type)) {
            returnObject.dim++;
            if (returnLastFoundArray && !Array.isArray(returnObject.type[0])) {
                return;
            }
            returnObject.type = returnObject.type[0];
            getDepth();
        }
    }
    getDepth();
    logSettings_1.logger.debug('Final getType: dim: %s, type:', returnObject.dim, returnObject.type);
    return returnObject;
}
exports.getType = getType;
/**
 * Is the provided input an class with an constructor?
 * @param obj The Value to test
 */
function isConstructor(obj) {
    var _a, _b;
    return typeof obj === 'function' && !isNullOrUndefined((_b = (_a = obj.prototype) === null || _a === void 0 ? void 0 : _a.constructor) === null || _b === void 0 ? void 0 : _b.name);
}
exports.isConstructor = isConstructor;
// /**
//  * Execute util.deprecate or when "process" does not exist use "console.log"
//  * (if "process" does not exist, the codes are not cached, and are always logged again)
//  * This Function is here to try to make typegoose compatible with the browser (see https://github.com/typegoose/typegoose/issues/33)
//  */
// eslint-disable-next-line @typescript-eslint/ban-types
// export function deprecate<T extends Function>(fn: T, message: string, code: string): T {
//   if (!isNullOrUndefined(process)) {
//     // eslint-disable-next-line @typescript-eslint/no-var-requires
//     return require('util').deprecate(fn, message, code);
//   }
//   console.log(`[${code}] DeprecationWarning: ${message}`);
//   return fn;
// }
/**
 * Logs an warning if "included > 0" that the options of not the current type are included
 * @param name Name of the Class
 * @param key Name of the Currently Processed key
 * @param type Name of the Expected Type
 * @param extra Extra string to be included
 * @param included Included Options to be listed
 */
function warnNotCorrectTypeOptions(name, key, type, extra, included) {
    // this "if" is in this function to de-duplicate code
    if (included.length > 0) {
        logSettings_1.logger.warn(`Type of "${name}.${key}" is not ${type}, but includes the following ${extra} options [W001]:\n` + `  [${included.join(', ')}]`);
    }
}
exports.warnNotCorrectTypeOptions = warnNotCorrectTypeOptions;
/**
 * Try to convert input "value" to a String, without it failing
 * @param value The Value to convert to String
 * @returns A String, either "value.toString" or a placeholder
 */
function toStringNoFail(value) {
    try {
        return String(value);
    }
    catch (_) {
        return '(Error: Converting value to String failed)';
    }
}
exports.toStringNoFail = toStringNoFail;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJuYWwvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQXVEO0FBQ3ZELHFDQUFxQztBQUNyQyxnREFBd0M7QUFpQnhDLDJDQUFnRTtBQUNoRSxpQ0FBOEQ7QUFDOUQscUNBT2tCO0FBRWxCOzs7O0dBSUc7QUFDSCxTQUFnQixXQUFXLENBQUMsSUFBUztJQUNuQyxJQUFJLE9BQU8sQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsSUFBSSxDQUFBLEtBQUssUUFBUSxFQUFFO1FBQ2xDLGtGQUFrRjtRQUNsRixzREFBc0Q7UUFDdEQsT0FBTyxDQUNMLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3JFLG1FQUFtRTtZQUNuRSxpRUFBaUU7WUFDakUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUNqRixDQUFDO0tBQ0g7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUM7QUFiRCxrQ0FhQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixXQUFXLENBQUMsSUFBUztJQUNuQyxJQUFJLE9BQU8sQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsSUFBSSxDQUFBLEtBQUssUUFBUSxFQUFFO1FBQ2xDLDJFQUEyRTtRQUMzRSxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUs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