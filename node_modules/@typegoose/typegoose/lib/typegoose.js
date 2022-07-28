"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Passthrough = exports.getDiscriminatorModelForClass = exports.deleteModelWithClass = exports.deleteModel = exports.addModelToTypegoose = exports.buildSchema = exports.getModelWithString = exports.getModelForClass = exports.PropType = exports.Severity = exports.getName = exports.getClass = exports.getClassForDocument = exports.types = exports.errors = exports.defaultClasses = exports.LogLevels = exports.setLogLevel = exports.setGlobalOptions = exports.mongoose = void 0;
const tslib_1 = require("tslib");
/* imports */
const mongoose = require("mongoose");
exports.mongoose = mongoose;
require("reflect-metadata");
const semver = require("semver");
const utils_1 = require("./internal/utils");
/* istanbul ignore next */
if (!(0, utils_1.isNullOrUndefined)(process === null || process === void 0 ? void 0 : process.version) && !(0, utils_1.isNullOrUndefined)(mongoose === null || mongoose === void 0 ? void 0 : mongoose.version)) {
    // for usage on client side
    /* istanbul ignore next */
    if (semver.lt(mongoose === null || mongoose === void 0 ? void 0 : mongoose.version, '6.5.0')) {
        throw new Error(`Please use mongoose 6.5.0 or higher (Current mongoose: ${mongoose.version}) [E001]`);
    }
    /* istanbul ignore next */
    if (semver.lt(process.version.slice(1), '12.22.0')) {
        throw new Error('You are using a NodeJS Version below 12.22.0, Please Upgrade! [E002]');
    }
}
const globalOptions_1 = require("./globalOptions");
Object.defineProperty(exports, "setGlobalOptions", { enumerable: true, get: function () { return globalOptions_1.setGlobalOptions; } });
const constants_1 = require("./internal/constants");
const data_1 = require("./internal/data");
const schema_1 = require("./internal/schema");
const logSettings_1 = require("./logSettings");
const typeguards_1 = require("./typeguards");
const errors_1 = require("./internal/errors");
var logSettings_2 = require("./logSettings");
Object.defineProperty(exports, "setLogLevel", { enumerable: true, get: function () { return logSettings_2.setLogLevel; } });
Object.defineProperty(exports, "LogLevels", { enumerable: true, get: function () { return logSettings_2.LogLevels; } });
(0, tslib_1.__exportStar)(require("./prop"), exports);
(0, tslib_1.__exportStar)(require("./hooks"), exports);
(0, tslib_1.__exportStar)(require("./plugin"), exports);
(0, tslib_1.__exportStar)(require("./index"), exports);
(0, tslib_1.__exportStar)(require("./modelOptions"), exports);
(0, tslib_1.__exportStar)(require("./queryMethod"), exports);
(0, tslib_1.__exportStar)(require("./typeguards"), exports);
exports.defaultClasses = require("./defaultClasses");
exports.errors = require("./internal/errors");
exports.types = require("./types");
var utils_2 = require("./internal/utils");
Object.defineProperty(exports, "getClassForDocument", { enumerable: true, get: function () { return utils_2.getClassForDocument; } });
Object.defineProperty(exports, "getClass", { enumerable: true, get: function () { return utils_2.getClass; } });
Object.defineProperty(exports, "getName", { enumerable: true, get: function () { return utils_2.getName; } });
var constants_2 = require("./internal/constants");
Object.defineProperty(exports, "Severity", { enumerable: true, get: function () { return constants_2.Severity; } });
Object.defineProperty(exports, "PropType", { enumerable: true, get: function () { return constants_2.PropType; } });
(0, globalOptions_1.parseENV)(); // call this before anything to ensure they are applied
/**
 * Build a Model From a Class
 * @param cl The Class to build a Model from
 * @param options Overwrite SchemaOptions (Merged with Decorator)
 * @returns The finished Model
 * @public
 * @example
 * ```ts
 * class ClassName {}
 *
 * const NameModel = getModelForClass(ClassName);
 * ```
 */
function getModelForClass(cl, options) {
    var _a, _b, _c, _d, _e, _f;
    (0, utils_1.assertionIsClass)(cl);
    const rawOptions = typeof options === 'object' ? options : {};
    const mergedOptions = (0, utils_1.mergeMetadata)(constants_1.DecoratorKeys.ModelOptions, rawOptions, cl);
    const name = (0, utils_1.getName)(cl, rawOptions); // use "rawOptions" instead of "mergedOptions" to consistently differentiate between classes & models
    if (data_1.models.has(name)) {
        return data_1.models.get(name);
    }
    const model = (_d = (_b = (_a = mergedOptions === null || mergedOptions === void 0 ? void 0 : mergedOptions.existingConnection) === null || _a === void 0 ? void 0 : _a.model.bind(mergedOptions.existingConnection)) !== null && _b !== void 0 ? _b : (_c = mergedOptions === null || mergedOptions === void 0 ? void 0 : mergedOptions.existingMongoose) === null || _c === void 0 ? void 0 : _c.model.bind(mergedOptions.existingMongoose)) !== null && _d !== void 0 ? _d : mongoose.model.bind(mongoose);
    const compiledmodel = model(name, buildSchema(cl, mergedOptions.schemaOptions, rawOptions));
    const refetchedOptions = (_e = Reflect.getMetadata(constants_1.DecoratorKeys.ModelOptions, cl)) !== null && _e !== void 0 ? _e : {};
    if ((_f = refetchedOptions === null || refetchedOptions === void 0 ? void 0 : refetchedOptions.options) === null || _f === void 0 ? void 0 : _f.runSyncIndexes) {
        // no async/await, to wait for execution on connection in the background
        compiledmodel.syncIndexes();
    }
    return addModelToTypegoose(compiledmodel, cl, {
        existingMongoose: mergedOptions === null || mergedOptions === void 0 ? void 0 : mergedOptions.existingMongoose,
        existingConnection: mergedOptions === null || mergedOptions === void 0 ? void 0 : mergedOptions.existingConnection,
    });
}
exports.getModelForClass = getModelForClass;
/**
 * Get Model from internal cache
 * @param key Model's name key
 * @example
 * ```ts
 * class ClassName {}
 * getModelForClass(ClassName); // build the model
 * const NameModel = getModelWithString<typeof ClassName>("ClassName");
 * ```
 */
function getModelWithString(key) {
    (0, utils_1.assertion)(typeof key === 'string', () => new errors_1.ExpectedTypeError('key', 'string', key));
    return data_1.models.get(key);
}
exports.getModelWithString = getModelWithString;
/**
 * Generates a Mongoose schema out of class props, iterating through all parents
 * @param cl The Class to build a Schema from
 * @param options Overwrite SchemaOptions (Merged with Decorator)
 * @param overwriteOptions Overwrite ModelOptions (aside from schemaOptions) (Not Merged with Decorator)
 * @returns Returns the Build Schema
 * @example
 * ```ts
 * class ClassName {}
 * const NameSchema = buildSchema(ClassName);
 * const NameModel = mongoose.model("Name", NameSchema);
 * ```
 */
function buildSchema(cl, options, overwriteOptions) {
    (0, utils_1.assertionIsClass)(cl);
    logSettings_1.logger.debug('buildSchema called for "%s"', (0, utils_1.getName)(cl, overwriteOptions));
    const mergedOptions = (0, utils_1.mergeSchemaOptions)(options, cl);
    let sch = undefined;
    /** Parent Constructor */
    let parentCtor = Object.getPrototypeOf(cl.prototype).constructor;
    /* This array is to execute from lowest class to highest (when extending) */
    const parentClasses = [];
    // iterate trough all parents
    while ((parentCtor === null || parentCtor === void 0 ? void 0 : parentCtor.name) !== 'Object') {
        // add lower classes (when extending) to the front of the arrray to be processed first
        parentClasses.unshift(parentCtor);
        // set next parent
        parentCtor = Object.getPrototypeOf(parentCtor.prototype).constructor;
    }
    // iterate and build class schemas from lowest to highest (when extending classes, the lower class will get build first) see https://github.com/typegoose/typegoose/pull/243
    for (const parentClass of parentClasses) {
        // extend schema
        sch = (0, schema_1._buildSchema)(parentClass, sch, mergedOptions, false);
    }
    // get schema of current model
    sch = (0, schema_1._buildSchema)(cl, sch, mergedOptions, true, overwriteOptions);
    return sch;
}
exports.buildSchema = buildSchema;
/**
 * Add a Class-Model Pair to the Typegoose Cache
 * This can be used to add custom Models to Typegoose, with the type information of "cl"
 * Note: no gurantee that the type information is fully correct when used manually
 * @param model The Model to store
 * @param cl The Class to store
 * @param options Overwrite existingMongoose or existingConnection
 * @example
 * ```ts
 * class ClassName {}
 *
 * const schema = buildSchema(ClassName);
 * // modifications to the schame can be done
 * const model = addModelToTypegoose(mongoose.model("Name", schema), ClassName);
 * ```
 */
function addModelToTypegoose(model, cl, options) {
    var _a, _b, _c;
    const mongooseModel = ((_a = options === null || options === void 0 ? void 0 : options.existingMongoose) === null || _a === void 0 ? void 0 : _a.Model) || ((_c = (_b = options === null || options === void 0 ? void 0 : options.existingConnection) === null || _b === void 0 ? void 0 : _b.base) === null || _c === void 0 ? void 0 : _c.Model) || mongoose.Model;
    (0, utils_1.assertion)(model.prototype instanceof mongooseModel, new errors_1.NotValidModelError(model, 'addModelToTypegoose.model'));
    (0, utils_1.assertionIsClass)(cl);
    const name = model.modelName;
    (0, utils_1.assertion)(!data_1.models.has(name), new errors_1.FunctionCalledMoreThanSupportedError('addModelToTypegoose', 1, `This was caused because the model name "${name}" already exists in the typegoose-internal "models" cache`));
    if (data_1.constructors.get(name)) {
        logSettings_1.logger.info('Class "%s" already existed in the constructors Map', name);
    }
    data_1.models.set(name, model);
    data_1.constructors.set(name, cl);
    return data_1.models.get(name);
}
exports.addModelToTypegoose = addModelToTypegoose;
/**
 * Deletes a existing model so that it can be overwritten with another model
 * (deletes from mongoose.connection and typegoose models cache and typegoose constructors cache)
 * @param name The Model's mongoose name
 * @example
 * ```ts
 * class ClassName {}
 * const NameModel = getModelForClass(ClassName);
 * deleteModel("ClassName");
 * ```
 */
function deleteModel(name) {
    (0, utils_1.assertion)(typeof name === 'string', () => new errors_1.ExpectedTypeError('name', 'string', name));
    logSettings_1.logger.debug('Deleting Model "%s"', name);
    const model = data_1.models.get(name);
    if (!(0, utils_1.isNullOrUndefined)(model)) {
        model.db.deleteModel(name);
    }
    data_1.models.delete(name);
    data_1.constructors.delete(name);
}
exports.deleteModel = deleteModel;
/**
 * Delete a model, with the given class
 * Same as "deleteModel", only that it can be done with the class instead of the name
 * @param cl The Class to delete the model from
 * @example
 * ```ts
 * class ClassName {}
 * const NameModel = getModelForClass(ClassName);
 * deleteModelWithClass(ClassName);
 * ```
 */
function deleteModelWithClass(cl) {
    (0, utils_1.assertionIsClass)(cl);
    let name = (0, utils_1.getName)(cl);
    if (!data_1.models.has(name)) {
        logSettings_1.logger.debug(`Class "${name}" is not in "models", trying to find in "constructors"`);
        let found = false;
        // type "Map" does not have a "find" function, and using "get" would maybe result in the incorrect values
        for (const [cname, constructor] of data_1.constructors) {
            if (constructor === cl) {
                logSettings_1.logger.debug(`Found Class in "constructors" with class name "${name}" and entered name "${cname}""`);
                name = cname;
                found = true;
            }
        }
        if (!found) {
            logSettings_1.logger.debug(`Could not find class "${name}" in constructors`);
            return;
        }
    }
    return deleteModel(name);
}
exports.deleteModelWithClass = deleteModelWithClass;
function getDiscriminatorModelForClass(from, cl, value_or_options, options) {
    (0, utils_1.assertion)((0, typeguards_1.isModel)(from), new errors_1.NotValidModelError(from, 'getDiscriminatorModelForClass.from'));
    (0, utils_1.assertionIsClass)(cl);
    const value = typeof value_or_options === 'string' ? value_or_options : undefined;
    const rawOptions = typeof value_or_options !== 'string' ? value_or_options : typeof options === 'object' ? options : {};
    const mergedOptions = (0, utils_1.mergeMetadata)(constants_1.DecoratorKeys.ModelOptions, rawOptions, cl);
    const name = (0, utils_1.getName)(cl, rawOptions); // use "rawOptions" instead of "mergedOptions" to consistently differentiate between classes & models
    if (data_1.models.has(name)) {
        return data_1.models.get(name);
    }
    const sch = buildSchema(cl, mergedOptions.schemaOptions, rawOptions);
    const discriminatorKey = sch.get('discriminatorKey');
    if (!!discriminatorKey && sch.path(discriminatorKey)) {
        sch.paths[discriminatorKey].options.$skipDiscriminatorCheck = true;
    }
    const model = from.discriminator(name, sch, value ? value : name);
    return addModelToTypegoose(model, cl);
}
exports.getDiscriminatorModelForClass = getDiscriminatorModelForClass;
/**
 * Use this class if raw mongoose for a path is wanted
 * It is still recommended to use the typegoose classes directly
 * @see Using `Passthrough`, the paths created will also result as an `Schema` (since mongoose 6.0), see {@link https://github.com/Automattic/mongoose/issues/7181 Mongoose#7181}
 * @example
 * ```ts
 * class Dummy {
 *   @prop({ type: () => new Passthrough({ somePath: String }) })
 *   public somepath: { somePath: string };
 * }
 *
 * class Dummy {
 *   @prop({ type: () => new Passthrough({ somePath: String }, true) })
 *   public somepath: { somePath: string };
 * }
 * ```
 */
class Passthrough {
    /**
     * Use this like `new mongoose.Schema()`
     * @param raw The Schema definition
     * @param direct Directly insert "raw", instead of using "type" (this will not apply any other inner options)
     */
    constructor(raw, direct) {
        this.raw = raw;
        this.direct = direct !== null && direct !== void 0 ? direct : false;
    }
}
exports.Passthrough = Passthrough;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZWdvb3NlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3R5cGVnb29zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsYUFBYTtBQUNiLHFDQUFxQztBQXVDNUIsNEJBQVE7QUF0Q2pCLDRCQUEwQjtBQUMxQixpQ0FBaUM7QUFDakMsNENBQThIO0FBRTlILDBCQUEwQjtBQUMxQixJQUFJLENBQUMsSUFBQSx5QkFBaUIsRUFBQyxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFBLHlCQUFpQixFQUFDLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxPQUFPLENBQUMsRUFBRTtJQUNqRiwyQkFBMkI7SUFDM0IsMEJBQTBCO0lBQzFCLElBQUksTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFO1FBQ3pDLE1BQU0sSUFBSSxLQUFLLENBQUMsMERBQTBELFFBQVEsQ0FBQyxPQUFPLFVBQVUsQ0FBQyxDQUFDO0tBQ3ZHO0lBRUQsMEJBQTBCO0lBQzFCLElBQUksTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRTtRQUNsRCxNQUFNLElBQUksS0FBSyxDQUFDLHNFQUFzRSxDQUFDLENBQUM7S0FDekY7Q0FDRjtBQUVELG1EQUE2RDtBQW9CMUMsaUdBcEJBLGdDQUFnQixPQW9CQTtBQW5CbkMsb0RBQXFEO0FBQ3JELDBDQUF1RDtBQUN2RCw4Q0FBaUQ7QUFDakQsK0NBQXVDO0FBQ3ZDLDZDQUF1QztBQVd2Qyw4Q0FBZ0g7QUFLaEgsNkNBQXVEO0FBQTlDLDBHQUFBLFdBQVcsT0FBQTtBQUFFLHdHQUFBLFNBQVMsT0FBQTtBQUMvQixzREFBdUI7QUFDdkIsdURBQXdCO0FBQ3hCLHdEQUF5QjtB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