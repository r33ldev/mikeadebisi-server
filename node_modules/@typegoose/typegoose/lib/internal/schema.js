"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._buildSchema = void 0;
const mongoose = require("mongoose");
const logSettings_1 = require("../logSettings");
const typegoose_1 = require("../typegoose");
const constants_1 = require("./constants");
const data_1 = require("./data");
const errors_1 = require("./errors");
const processProp_1 = require("./processProp");
const utils_1 = require("./utils");
/**
 * Internal Schema Builder for Classes
 * This Function should not be used directly outside of typegoose internals, use "buildSchema" from typegoose.ts directly
 * @param cl The Class to build a Model from
 * @param origSch A Schema to clone and extend onto
 * @param opt Overwrite SchemaOptions (Merged with Decorator Options)
 * @param isFinalSchema Set if this Schema is the final (top-level) to build, only when "true" are discriminators, hooks, virtuals, etc applied
 * @param overwriteOptions Overwrite ModelOptions for Name Generation (Not Merged with Decorator)
 * @returns Returns the Build Schema
 * @private
 */
function _buildSchema(cl, origSch, opt, isFinalSchema = true, overwriteOptions) {
    var _a, _b;
    (0, utils_1.assertionIsClass)(cl);
    (0, utils_1.assignGlobalModelOptions)(cl); // to ensure global options are applied to the current class
    // Options sanity check
    opt = (0, utils_1.mergeSchemaOptions)((0, utils_1.isNullOrUndefined)(opt) || typeof opt !== 'object' ? {} : opt, cl);
    /** used, because when trying to resolve an child, the overwriteOptions for that child are not available */
    const className = (0, utils_1.getName)(cl);
    const finalName = (0, utils_1.getName)(cl, overwriteOptions);
    logSettings_1.logger.debug('_buildSchema Called for %s with options:', finalName, opt);
    /** Simplify the usage */
    const Schema = mongoose.Schema;
    const ropt = (_a = Reflect.getMetadata(constants_1.DecoratorKeys.ModelOptions, cl)) !== null && _a !== void 0 ? _a : {};
    const schemaOptions = Object.assign({}, (_b = ropt === null || ropt === void 0 ? void 0 : ropt.schemaOptions) !== null && _b !== void 0 ? _b : {}, opt);
    const decorators = Reflect.getMetadata(constants_1.DecoratorKeys.PropCache, cl.prototype);
    if (!(0, utils_1.isNullOrUndefined)(decorators)) {
        for (const decorator of decorators.values()) {
            (0, processProp_1.processProp)(decorator);
        }
    }
    if (!data_1.schemas.has(className)) {
        data_1.schemas.set(className, {});
    }
    let sch;
    if (!(origSch instanceof Schema)) {
        sch = new Schema(data_1.schemas.get(className), schemaOptions);
    }
    else {
        sch = origSch.clone();
        sch.add(data_1.schemas.get(className));
    }
    sch.loadClass(cl);
    if (isFinalSchema) {
        /** Get Metadata for Nested Discriminators */
        const disMap = Reflect.getMetadata(constants_1.DecoratorKeys.NestedDiscriminators, cl);
        if (disMap instanceof Map) {
            for (const [key, discriminators] of disMap) {
                logSettings_1.logger.debug('Applying Nested Discriminators for:', key, discriminators);
                const path = sch.path(key);
                // TODO: add test for this error
                (0, utils_1.assertion)(!(0, utils_1.isNullOrUndefined)(path), () => new errors_1.PathNotInSchemaError(finalName, key));
                // TODO: add test for this error
                (0, utils_1.assertion)(typeof path.discriminator === 'function', () => new errors_1.NoDiscriminatorFunctionError(finalName, key));
                for (const { type: child, value: childName } of discriminators) {
                    const childSch = (0, utils_1.getName)(child) === finalName ? sch : (0, typegoose_1.buildSchema)(child);
                    const discriminatorKey = childSch.get('discriminatorKey');
                    if (!!discriminatorKey && childSch.path(discriminatorKey)) {
                        // skip this check, otherwise "extends DiscriminatorBase" would not be allowed (discriminators cannot have the discriminator key defined multiple times)
                        childSch.paths[discriminatorKey].options.$skipDiscriminatorCheck = true;
                    }
                    path.discriminator((0, utils_1.getName)(child), childSch, childName);
                }
            }
        }
        // Hooks
        {
            /** Get Metadata for PreHooks */
            const preHooks = Reflect.getMetadata(constants_1.DecoratorKeys.HooksPre, cl);
            if (Array.isArray(preHooks)) {
                preHooks.forEach((obj) => sch.pre(obj.method, obj.options, obj.func));
            }
            /** Get Metadata for PreHooks */
            const postHooks = Reflect.getMetadata(constants_1.DecoratorKeys.HooksPost, cl);
            if (Array.isArray(postHooks)) {
                postHooks.forEach((obj) => sch.post(obj.method, obj.options, obj.func));
            }
        }
        /** Get Metadata for Virtual Populates */
        const virtuals = Reflect.getMetadata(constants_1.DecoratorKeys.VirtualPopulate, cl);
        if (virtuals instanceof Map) {
            for (const [key, options] of virtuals) {
                logSettings_1.logger.debug('Applying Virtual Populates:', key, options);
                sch.virtual(key, options);
            }
        }
        /** Get Metadata for indices */
        const indices = Reflect.getMetadata(constants_1.DecoratorKeys.Index, cl);
        if (Array.isArray(indices)) {
            for (const index of indices) {
                logSettings_1.logger.debug('Applying Index:', index);
                sch.index(index.fields, index.options);
            }
        }
        /** Get Metadata for Query Methods */
        const queryMethods = Reflect.getMetadata(constants_1.DecoratorKeys.QueryMethod, cl);
        if (queryMethods instanceof Map) {
            for (const [funcName, func] of queryMethods) {
                logSettings_1.logger.debug('Applying Query Method:', funcName, func);
                sch.query[funcName] = func;
            }
        }
        /** Get Metadata for indices */
        const plugins = Reflect.getMetadata(constants_1.DecoratorKeys.Plugins, cl);
        if (Array.isArray(plugins)) {
            for (const plugin of plugins) {
                logSettings_1.logger.debug('Applying Plugin:', plugin);
                sch.plugin(plugin.mongoosePlugin, plugin.options);
            }
        }
        // this method is to get the typegoose name of the model/class if it is user-handled (like buildSchema, then manually mongoose.model)
        sch.method('typegooseName', () => {
            return finalName;
        });
    }
    // add the class to the constructors map
    data_1.constructors.set(finalName, cl);
    return sch;
}
exports._buildSchema = _buildSchema;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFsL3NjaGVtYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBcUM7QUFDckMsZ0RBQXdDO0FBQ3hDLDRDQUEyQztBQVkzQywyQ0FBNEM7QUFDNUMsaUNBQStDO0FBQy9DLHFDQUE4RTtBQUM5RSwrQ0FBNEM7QUFDNUMsbUNBQWdJO0FBRWhJOzs7Ozs7Ozs7O0dBVUc7QUFDSCxTQUFnQixZQUFZLENBQzFCLEVBQUssRUFDTCxPQUE4QixFQUM5QixHQUE0QixFQUM1QixnQkFBeUIsSUFBSSxFQUM3QixnQkFBZ0M7O0lBRWhDLElBQUEsd0JBQWdCLEVBQUMsRUFBRSxDQUFDLENBQUM7SUFFckIsSUFBQSxnQ0FBd0IsRUFBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLDREQUE0RDtJQUUxRix1QkFBdUI7SUFDdkIsR0FBRyxHQUFHLElBQUEsMEJBQWtCLEVBQUMsSUFBQSx5QkFBaUIsRUFBQyxHQUFHLENBQUMsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTNGLDJHQUEyRztJQUMzRyxNQUFNLFNBQVMsR0FBRyxJQUFBLGVBQU8sRUFBQyxFQUFFLENBQUMsQ0FBQztJQUM5QixNQUFNLFNBQVMsR0FBRyxJQUFBLGVBQU8sRUFBQyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUVoRCxvQkFBTSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFekUseUJBQXlCO0lBQ3pCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7SUFDL0IsTUFBTSxJQUFJLEdBQWtCLE1BQUEsT0FBTyxDQUFDLFdBQVcsQ0FBQyx5QkFBYSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsbUNBQUksRUFB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