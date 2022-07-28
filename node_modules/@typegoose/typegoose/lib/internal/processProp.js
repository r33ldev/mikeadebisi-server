"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processProp = void 0;
const tslib_1 = require("tslib");
const logSettings_1 = require("../logSettings");
const typegoose_1 = require("../typegoose");
const constants_1 = require("./constants");
const data_1 = require("./data");
const errors_1 = require("./errors");
const utils = require("./utils");
/**
 * Function that is the actual processing of the prop's (used for caching)
 * @param input All the options needed for prop's
 */
function processProp(input) {
    var _a, _b, _c;
    const { key, target } = input;
    const name = utils.getName(target);
    const rawOptions = Object.assign({}, input.options);
    let Type = Reflect.getMetadata(constants_1.DecoratorKeys.Type, target, key);
    const propKind = (_a = input.whatis) !== null && _a !== void 0 ? _a : detectPropType(Type);
    logSettings_1.logger.debug('Starting to process "%s.%s"', name, key);
    utils.assertion(typeof key === 'string', () => new errors_1.CannotBeSymbolError(name, key));
    // optionDeprecation(rawOptions);
    {
        // soft errors & "type"-alias mapping
        switch (propKind) {
            case constants_1.PropType.NONE:
                break;
            case constants_1.PropType.MAP:
            case constants_1.PropType.ARRAY:
                // set the "Type" to undefined if "ref" or "refPath" are defined, as an fallback in case "type" is also not defined
                if (('ref' in rawOptions || 'refPath' in rawOptions) && !('type' in rawOptions)) {
                    Type = undefined;
                }
                break;
        }
    }
    if (!utils.isNullOrUndefined(rawOptions.type)) {
        logSettings_1.logger.info('Prop Option "type" is set to ', rawOptions.type);
        const gotType = utils.getType(rawOptions.type);
        Type = gotType.type;
        if (gotType.dim > 0) {
            rawOptions.dim = gotType.dim;
        }
        delete rawOptions.type;
    }
    // prevent "infinite" buildSchema loop / Maximum Stack size exceeded
    if (Type === target.constructor) {
        throw new errors_1.SelfContainingClassError(name, key);
    }
    // map to correct buffer type, otherwise it would result in "Mixed"
    if (Type === typegoose_1.mongoose.Types.Buffer) {
        Type = typegoose_1.mongoose.Schema.Types.Buffer;
    }
    // confirm that "PropType" is an ARRAY and if that the Type is still an *ARRAY, set them to Mixed
    // for issues like https://github.com/typegoose/typegoose/issues/300
    if (propKind === constants_1.PropType.ARRAY && detectPropType(Type) === constants_1.PropType.ARRAY) {
        logSettings_1.logger.debug('Type is still *ARRAY, defaulting to Mixed');
        Type = typegoose_1.mongoose.Schema.Types.Mixed;
    }
    // confirm that "PropType" is an MAP and if that the Type is still an *MAP, set them to Mixed
    if (propKind === constants_1.PropType.MAP && detectPropType(Type) === constants_1.PropType.MAP) {
        logSettings_1.logger.debug('Type is still *Map, defaulting to Mixed');
        Type = typegoose_1.mongoose.Schema.Types.Mixed;
    }
    if (utils.isNotDefined(Type)) {
        (0, typegoose_1.buildSchema)(Type);
    }
    if ('discriminators' in rawOptions) {
        logSettings_1.logger.debug('Found option "discriminators" in "%s.%s"', name, key);
        const gotType = utils.getType(rawOptions.discriminators, true);
        utils.assertion(gotType.dim === 1, () => new errors_1.OptionDoesNotSupportOptionError('discriminators', 'dim', '1', `dim: ${gotType.dim}`));
        const discriminators = gotType.type.map((val, index) => {
            if (utils.isConstructor(val)) {
                return { type: val };
            }
            if (typeof val === 'object') {
                if (!('type' in val)) {
                    throw new Error(`"${name}.${key}" discriminator index "${index}" is an object, but does not contain the "type" property!`);
                }
                return val;
            }
            throw new Error(`"${name}.${key}" discriminators index "${index}" is not an object or an constructor!`);
        });
        const disMap = new Map((_b = Reflect.getMetadata(constants_1.DecoratorKeys.NestedDiscriminators, target.constructor)) !== null && _b !== void 0 ? _b : []);
        disMap.set(key, discriminators);
        Reflect.defineMetadata(constants_1.DecoratorKeys.NestedDiscriminators, disMap, target.constructor);
        delete rawOptions.discriminators;
    }
    // allow setting the type asynchronously
    if ('ref' in rawOptions) {
        const gotType = utils.getType(rawOptions.ref);
        utils.assertion(gotType.dim === 0, () => new errors_1.OptionDoesNotSupportOptionError('ref', 'dim', '0', `dim: ${gotType.dim}`));
        rawOptions.ref = gotType.type;
        utils.assertion(!utils.isNullOrUndefined(rawOptions.ref), () => new errors_1.RefOptionIsUndefinedError(name, key));
        rawOptions.ref =
            typeof rawOptions.ref === 'string'
                ? rawOptions.ref
                : utils.isConstructor(rawOptions.ref)
                    ? utils.getName(rawOptions.ref)
                    : rawOptions.ref;
    }
    if (utils.isWithVirtualPOP(rawOptions)) {
        if (!utils.includesAllVirtualPOP(rawOptions)) {
            throw new errors_1.NotAllVPOPElementsError(name, key);
        }
        const virtuals = new Map((_c = Reflect.getMetadata(constants_1.DecoratorKeys.VirtualPopulate, target.constructor)) !== null && _c !== void 0 ? _c : []);
        virtuals.set(key, rawOptions);
        Reflect.defineMetadata(constants_1.DecoratorKeys.VirtualPopulate, virtuals, target.constructor);
        return;
    }
    if ('justOne' in rawOptions) {
        logSettings_1.logger.warn(`Option "justOne" is defined in "${name}.${key}" but no Virtual-Populate-Options!\n` +
            'Look here for more: https://typegoose.github.io/typegoose/docs/api/virtuals#virtual-populate');
    }
    const schemaProp = utils.initProperty(name, key, propKind);
    // do this early, because the other options (enum, ref, refPath, discriminators) should not matter for this one
    if (Type instanceof typegoose_1.Passthrough) {
        logSettings_1.logger.debug('Type is "instanceof Passthrough" ("%s.%s", %s, direct: %s)', name, key, propKind, Type.direct);
        // this is because the check above narrows down the type, which somehow is not compatible
        const newType = Type.raw;
        if (Type.direct) {
            schemaProp[key] = newType;
            return;
        }
        switch (propKind) {
            case constants_1.PropType.ARRAY:
                schemaProp[key] = utils.mapArrayOptions(rawOptions, newType, target, key);
                return;
            case constants_1.PropType.MAP:
                const mapped = utils.mapOptions(rawOptions, newType, target, key);
                schemaProp[key] = Object.assign(Object.assign({}, mapped.outer), { type: Map, of: Object.assign({ type: newType }, mapped.inner) });
                return;
            case constants_1.PropType.NONE:
                schemaProp[key] = Object.assign(Object.assign({}, rawOptions), { type: newType });
                return;
            default:
                throw new errors_1.InvalidPropTypeError(propKind, name, key, 'PropType(Passthrough)');
        }
    }
    // use "Type" if it is an suitable ref-type, otherwise default back to "ObjectId"
    const refType = utils.isAnRefType(Type) ? Type : typegoose_1.mongoose.Schema.Types.ObjectId;
    if ('ref' in rawOptions) {
        const ref = rawOptions.ref;
        delete rawOptions.ref;
        switch (propKind) {
            case constants_1.PropType.ARRAY:
                schemaProp[key] = utils.mapArrayOptions(rawOptions, refType, target, key, undefined, { ref });
                break;
            case constants_1.PropType.NONE:
                schemaProp[key] = Object.assign({ type: refType, ref }, rawOptions);
                break;
            case constants_1.PropType.MAP:
                const mapped = utils.mapOptions(rawOptions, refType, target, key);
                schemaProp[key] = Object.assign(Object.assign({}, mapped.outer), { type: Map, of: Object.assign({ type: refType, ref }, mapped.inner) });
                break;
            default:
                throw new errors_1.InvalidPropTypeError(propKind, name, key, 'PropType(ref)');
        }
        return;
    }
    if ('refPath' in rawOptions) {
        const refPath = rawOptions.refPath;
        delete rawOptions.refPath;
        utils.assertion(typeof refPath === 'string' && refPath.length > 0, () => new errors_1.StringLengthExpectedError(1, refPath, `${name}.${key}`, 'refPath'));
        switch (propKind) {
            case constants_1.PropType.ARRAY:
                schemaProp[key] = utils.mapArrayOptions(rawOptions, refType, target, key, undefined, { refPath });
                break;
            case constants_1.PropType.NONE:
                schemaProp[key] = Object.assign({ type: refType, refPath }, rawOptions);
                break;
            default:
                throw new errors_1.InvalidPropTypeError(propKind, name, key, 'PropType(refPath)');
        }
        return;
    }
    // check if Type is actually a real working Type
    if (utils.isNullOrUndefined(Type) || typeof Type !== 'function') {
        throw new errors_1.InvalidTypeError(name, key, Type);
    }
    const enumOption = rawOptions.enum;
    if (!utils.isNullOrUndefined(enumOption)) {
        // check if the supplied value is already "mongoose-consumeable"
        if (!Array.isArray(enumOption)) {
            if (Type === String || Type === typegoose_1.mongoose.Schema.Types.String) {
                rawOptions.enum = Object.entries(enumOption) // get all key-value pairs of the enum
                    // no reverse-filtering because if it is full of strings, there is no reverse mapping
                    .map(([enumKey, enumValue]) => {
                    // convert key-value pairs to an mongoose-usable enum
                    // safeguard, this should never happen because TypeScript only sets "design:type" to "String"
                    // if the enum is full of strings
                    if (typeof enumValue !== 'string') {
                        throw new errors_1.NotStringTypeError(name, key, enumKey, typeof enumValue);
                    }
                    return enumValue;
                });
            }
            else if (Type === Number || Type === typegoose_1.mongoose.Schema.Types.Number) {
                rawOptions.enum = Object.entries(enumOption) // get all key-value pairs of the enum
                    // filter out the "reverse (value -> name) mappings"
                    // https://www.typescriptlang.org/docs/handbook/enums.html#reverse-mappings
                    .filter(([enumKey, enumValue], _i, arr) => {
                    // safeguard, this should never happen because typescript only sets "design:type" to "Number"
                    // if the enum is full of numbers
                    if (utils.isNullOrUndefined(enumValue) || arr.findIndex(([k]) => k === enumValue.toString()) <= -1) {
                        // if there is no reverse mapping, throw an error
                        throw new errors_1.NotNumberTypeError(name, key, enumKey, typeof enumValue);
                    }
                    return typeof enumValue === 'number';
                })
                    .map(([enumKey, enumValue]) => {
                    // convert key-value pairs to an mongoose-useable enum
                    if (typeof enumValue !== 'number') {
                        throw new errors_1.NotNumberTypeError(name, key, enumKey, typeof enumValue);
                    }
                    return enumValue;
                });
            }
            else {
                // this will happen if the enum type is not "String" or "Number"
                // most likely this error happened because the code got transpiled with babel or "tsc --transpile-only"
                throw new errors_1.InvalidEnumTypeError(name, key, Type);
            }
        }
    }
    if (!utils.isNullOrUndefined(rawOptions.addNullToEnum)) {
        rawOptions.enum = Array.isArray(rawOptions.enum) ? rawOptions.enum : [];
        rawOptions.enum.push(null);
        delete rawOptions.addNullToEnum;
    }
    {
        let included = utils.isWithStringValidate(rawOptions);
        if (!utils.isString(Type)) {
            // warn if String-Validate options are included, but is not string
            utils.warnNotCorrectTypeOptions(name, key, 'String', 'String-Validate', included);
        }
        included = utils.isWithStringTransform(rawOptions);
        if (!utils.isString(Type)) {
            // warn if String-Transform options are included, but is not string
            utils.warnNotCorrectTypeOptions(name, key, 'String', 'String-Transform', included);
        }
        included = utils.isWithNumberValidate(rawOptions);
        if (!utils.isNumber(Type)) {
            // warn if Number-Validate options are included, but is not number
            utils.warnNotCorrectTypeOptions(name, key, 'Number', 'Number-Validate', included);
        }
        included = utils.isWithEnumValidate(rawOptions);
        if (!utils.isString(Type) && !utils.isNumber(Type)) {
            // warn if "enum" is included, but is not Number or String
            utils.warnNotCorrectTypeOptions(name, key, 'String | Number', 'extra', included);
        }
    }
    /** Is this Type (/Class) in the schemas Map? */
    const isInSchemas = data_1.schemas.has(utils.getName(Type));
    if (utils.isPrimitive(Type)) {
        if (utils.isObject(Type, true)) {
            utils.warnMixed(target, key);
        }
        switch (propKind) {
            case constants_1.PropType.ARRAY:
                schemaProp[key] = utils.mapArrayOptions(rawOptions, Type, target, key);
                return;
            case constants_1.PropType.MAP:
                let mapped;
                let finalType;
                // Map the correct options for the end type
                if (utils.isTypeMeantToBeArray(rawOptions)) {
                    mapped = utils.mapOptions(rawOptions, typegoose_1.mongoose.Schema.Types.Array, target, key);
                    // "rawOptions" is not used here, because that would duplicate some options to where the should not be
                    finalType = utils.mapArrayOptions(Object.assign(Object.assign({}, mapped.inner), { dim: rawOptions.dim }), Type, target, key);
                }
                else {
                    mapped = utils.mapOptions(rawOptions, Type, target, key);
                    finalType = Object.assign(Object.assign({}, mapped.inner), { type: Type });
                }
                schemaProp[key] = Object.assign(Object.assign({}, mapped.outer), { type: Map, of: Object.assign({}, finalType) });
                return;
            case constants_1.PropType.NONE:
                schemaProp[key] = Object.assign(Object.assign({}, rawOptions), { type: Type });
                return;
            default:
                throw new errors_1.InvalidPropTypeError(propKind, name, key, 'PropType(primitive)');
        }
    }
    // If the 'Type' is not a 'Primitive Type' and no subschema was found treat the type as 'Object'
    // so that mongoose can store it as nested document
    if (utils.isObject(Type) && !isInSchemas) {
        utils.warnMixed(target, key);
        logSettings_1.logger.warn('if someone can see this message, please open an new issue at https://github.com/typegoose/typegoose/issues with reproduction code for tests');
        schemaProp[key] = Object.assign(Object.assign({}, rawOptions), { type: typegoose_1.mongoose.Schema.Types.Mixed });
        return;
    }
    const virtualSchema = (0, typegoose_1.buildSchema)(Type);
    switch (propKind) {
        case constants_1.PropType.ARRAY:
            schemaProp[key] = utils.mapArrayOptions(rawOptions, virtualSchema, target, key, Type);
            return;
        case constants_1.PropType.MAP:
            // special handling if the lower type should be an array
            if ('dim' in rawOptions) {
                logSettings_1.logger.debug('Map SubDocument Array for "%s.%s"', name, key);
                const _d = utils.mapArrayOptions(rawOptions, virtualSchema, target, key, Type), { type } = _d, outer = (0, tslib_1.__rest)(_d, ["type"]);
                schemaProp[key] = Object.assign(Object.assign({}, outer), { type: Map, of: type });
                return;
            }
            const mapped = utils.mapOptions(rawOptions, virtualSchema, target, key, Type);
            schemaProp[key] = Object.assign(Object.assign({}, mapped.outer), { type: Map, of: Object.assign({ type: virtualSchema }, mapped.inner) });
            return;
        case constants_1.PropType.NONE:
            schemaProp[key] = Object.assign(Object.assign({}, rawOptions), { type: virtualSchema });
            return;
        default:
            throw new errors_1.InvalidPropTypeError(propKind, name, key, 'PropType(subSchema)');
    }
}
exports.processProp = processProp;
// The following function ("optionDeprecation") is disabled until used again
/**
 * Check for deprecated options, and if needed process them
 * @param options
 */
// function optionDeprecation(options: any) {}
/**
 * Detect "PropType" based on "Type"
 * @param Type The Type used for detection
 */
function detectPropType(Type) {
    logSettings_1.logger.debug('Detecting PropType');
    if (Type === Array ||
        Type === typegoose_1.mongoose.Types.Array ||
        Type === typegoose_1.mongoose.Schema.Types.Array ||
        Type === typegoose_1.mongoose.Types.DocumentArray ||
        Type === typegoose_1.mongoose.Schema.Types.DocumentArray) {
        return constants_1.PropType.ARRAY;
    }
    if (Type === Map || Type === typegoose_1.mongoose.Types.Map || Type === typegoose_1.mongoose.Schema.Types.Map) {
        return constants_1.PropType.MAP;
    }
    return constants_1.PropType.NONE;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzc1Byb3AuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJuYWwvcHJvY2Vzc1Byb3AudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLGdEQUF3QztBQUN4Qyw0Q0FBa0U7QUFVbEUsMkNBQXNEO0FBQ3RELGlDQUFpQztBQUNqQyxxQ0FZa0I7QUFDbEIsaUNBQWlDO0FBRWpDOzs7R0FHRztBQUNILFNBQWdCLFdBQVcsQ0FBQyxLQUFnQzs7SUFDMUQsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUM7SUFDOUIsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuQyxNQUFNLFVBQVUsR0FBaUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2xFLElBQUksSUFBSSxHQUFvQixPQUFPLENBQUMsV0FBVyxDQUFDLHlCQUFhLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqRixNQUFNLFFBQVEsR0FBRyxNQUFBLEtBQUssQ0FBQyxNQUFNLG1DQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUV0RCxvQkFBTSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdkQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSw0QkFBbUIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUVuRixpQ0FBaUM7SUFFakM7UUFDRSxxQ0FBcUM7UUFDckMsUUFBUSxRQUFRLEVBQUU7WUFDaEIsS0FBSyxvQkFBUSxDQUFDLElBQUk7Z0JBQ2hCLE1BQU07WUFDUixLQUFLLG9CQUFRLENBQUMsR0FBRyxDQUFDO1lBQ2xCLEtBQUssb0JBQVEsQ0FBQyxLQUFLO2dCQUNqQixtSEFBbUg7Z0JBQ25ILElBQUksQ0FBQyxLQUFLLElBQUksVUFBVSxJQUFJLFNBQVMsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLFVBQVUsQ0FBQyxFQUFFO29CQUMvRSxJQUFJLEdBQUcsU0FBUyxDQUFDO2lCQUNsQjtnQkFFRCxNQUFNO1NBQ1Q7S0FDRjtJQUVELElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQzdDLG9CQUFNLENBQUMsSUFBSSxDQUFDLCtCQUErQixFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5RCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztRQUVwQixJQUFJLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFO1lBQ25CLFVBQVUsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztTQUM5QjtRQUVELE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQztLQUN4QjtJQUVELG9FQUFvRTtJQUNwRSxJQUFJLElBQUksS0FBSyxNQUFNLENBQUMsV0FBVyxFQUFFO1FBQy9CLE1BQU0sSUFBSSxpQ0FBd0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDL0M7SUFFRCxtRUFBbUU7SUFDbkUsSUFBSSxJQUFJLEtBQUssb0JBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO1FBQ2xDLElBQUksR0FBRyxvQkFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0tBQ3JDO0lBRUQsaUdBQWlHO0lBQ2pHLG9FQUFvRTtJQUNwRSxJQUFJLFFBQVEsS0FBSyxvQkFBUSxDQUFDLEtBQUssSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssb0JBQVEsQ0FBQyxLQUFLLEVBQUU7UUFDMUUsb0JBQU0sQ0FBQyxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztRQUMxRCxJQUFJLEdBQUcsb0JBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztLQUNwQztJQUVELDZGQUE2RjtJQUM3RixJQUFJLFFBQVEsS0FBSyxvQkFBUSxDQUFDLEdBQUcsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssb0JBQVEsQ0FBQyxHQUFHLEVBQUU7UUFDdEUsb0JBQU0sQ0FBQyxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztRQUN4RCxJQUFJLEdBQUcsb0JBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztLQUNwQztJQUVELElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUM1QixJQUFBLHVCQUFXLEVBQUMsSUFBSSxDQUFDLENBQUM7S0FDbkI7SUFFRCxJQUFJLGdCQUFnQixJQUFJLFVBQVUsRUFBRTtRQUNsQyxvQkFBTSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDcEUsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQy9ELEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSx3Q0FBK0IsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNuSSxNQUFNLGNBQWMsR0FBMkIsT0FBTyxDQUFDLElBQTJELENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3BJLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDNUIsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQzthQUN0QjtZQUNELElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO2dCQUMzQixJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLEVBQUU7b0JBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksR0FBRywwQkFBMEIsS0FBSywyREFBMkQsQ0FBQyxDQUFDO2lCQUM1SDtnQkFFRCxPQUFPLEdBQUcsQ0FBQzthQUNaO1lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxHQUFHLDJCQUEyQixLQUFLLHVDQUF1QyxDQUFDLENBQUM7UUFDMUcsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBNEIsSUFBSSxHQUFHLENBQUMsTUFBQSxPQUFPLENBQUMsV0FBVyxDQUFDLHlCQUFhLENBQUMsb0JBQW9CLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxtQ0FBSSxFQUFFLENBQUMsQ0FBQztRQUNuSSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNoQyxPQUFPLENBQUMsY0FBYyxDQUFDLHlCQUFhLENBQUMsb0JBQW9CLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV2RixPQUFPLFVBQVUsQ0FBQyxjQUFjLENBQUM7S0FDbEM7SUFFRCx3Q0FBd0M7SUFDeEMsSUFBSSxLQUFLLElBQUksVUFBVSxFQUFFO1FBQ3ZCLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSx3Q0FBK0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDeEgsVUFBVSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQzlCLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksa0NBQXlCLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFMUcsVUFBVSxDQUFDLEdBQUc7WUFDWixPQUFPLFVBQVUsQ0FBQyxHQUFHLEtBQUssUUFBUTtnQkFDaEMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHO2dCQUNoQixDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDO29CQUNyQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDO29CQUMvQixDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztLQUN0QjtJQUVELElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxFQUFFO1FBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDNUMsTUFBTSxJQUFJLGdDQUF1QixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztTQUM5QztRQUVELE1BQU0sUUFBUSxHQUF1QixJQUFJLEdBQUcsQ0FBQyxNQUFBLE9BQU8sQ0FBQyxXQUFXLENBQUMseUJBQWEsQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxtQ0FBSSxFQUFFLENBQUMsQ0FBQztRQUMzSCxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM5QixPQUFPLENBQUMsY0FBYyxDQUFDLHlCQUFhLENBQUMsZUFBZSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFcEYsT0FBTztLQUNSO0lBRUQsSUFBSSxTQUFTLElBQUksVUFBVSxFQUFFO1FBQzNCLG9CQUFNLENBQUMsSUFBSSxDQUNULG1DQUFtQyxJQUFJLElBQUksR0FBRyxzQ0FBc0M7WUFDbEYsOEZBQThGLENBQ2pHLENBQUM7S0FDSDtJQUVELE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUUzRCwrR0FBK0c7SUFDL0csSUFBSSxJQUFJLFlBQVksdUJBQVcsRUFBRTtRQUMvQixvQkFBTSxDQUFDLEtBQUssQ0FBQyw0REFBNEQsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0cseUZBQXlGO1FBQ3pGLE1BQU0sT0FBTyxHQUFRLElBQUksQ0FBQyxHQUFHLENBQUM7UUFFOUIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2YsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQztZQUUxQixPQUFPO1NBQ1I7UUFFRCxRQUFRLFFBQVEsRUFBRTtZQUNoQixLQUFLLG9CQUFRLENBQUMsS0FBSztnQkFDakIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBRTFFLE9BQU87WUFDVCxLQUFLLG9CQUFRLENBQUMsR0FBRztnQkFDZixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUVsRSxVQUFVLENBQUMsR0FBRyxDQUFDLG1DQUNWLE1BQU0sQ0FBQyxLQUFLLEtBQ2YsSUFBSSxFQUFFLEdBQUcsRUFDVCxFQUFFLGtCQUFJLElBQUksRUFBRSxPQUFPLElBQUssTUFBTSxDQUFDLEtBQUssSUFDckMsQ0FBQztnQkFFRixPQUFPO1lBQ1QsS0FBSyxvQkFBUSxDQUFDLElBQUk7Z0JBQ2hCLFVBQVUsQ0FBQyxHQUFHLENBQUMsbUNBQ1YsVUFBVSxLQUNiLElBQUksRUFBRSxPQUFPLEdBQ2QsQ0FBQztnQkFFRixPQUFPO1lBQ1Q7Z0JBQ0UsTUFBTSxJQUFJLDZCQUFvQixDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLHVCQUF1QixDQUFDLENBQUM7U0FDaEY7S0FDRjtJQUVELGlGQUFpRjtJQUNqRixNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLG9CQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7SUFFaEYsSUFBSSxLQUFLLElBQUksVUFBVSxFQUFFO1FBQ3ZCLE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUM7UUFDM0IsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDO1FBRXRCLFFBQVEsUUFBUSxFQUFFO1lBQ2hCLEtBQUssb0JBQVEsQ0FBQyxLQUFLO2dCQUNqQixVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDOUYsTUFBTTtZQUNSLEtBQUssb0JBQVEsQ0FBQyxJQUFJO2dCQUNoQixVQUFVLENBQUMsR0FBRyxDQUFDLG1CQUNiLElBQUksRUFBRSxPQUFPLEVBQ2IsR0FBRyxJQUNBLFVBQVUsQ0FDZCxDQUFDO2dCQUNGLE1BQU07WUFDUixLQUFLLG9CQUFRLENBQUMsR0FBRztnQkFDZixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUVsRSxVQUFVLENBQUMsR0FBRyxDQUFDLG1DQUNWLE1BQU0sQ0FBQyxLQUFLLEtBQ2YsSUFBSSxFQUFFLEdBQUcsRUFDVCxFQUFFLGtCQUNBLElBQUksRUFBRSxPQUFPLEVBQ2IsR0FBRyxJQUNBLE1BQU0sQ0FBQyxLQUFLLElBRWxCLENBQUM7Z0JBQ0YsTUFBTTtZQUNSO2dCQUNFLE1BQU0sSUFBSSw2QkFBb0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxlQUFlLENBQUMsQ0FBQztTQUN4RTtRQUVELE9BQU87S0FDUjtJQUVELElBQUksU0FBUyxJQUFJLFVBQVUsRUFBRTtRQUMzQixNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQ25DLE9BQU8sVUFBVSxDQUFDLE9BQU8sQ0FBQztRQUUxQixLQUFLLENBQUMsU0FBUyxDQUNiLE9BQU8sT0FBTyxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDakQsR0FBRyxFQUFFLENBQUMsSUFBSSxrQ0FBeUIsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxJQUFJLEdBQUcsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUM3RSxDQUFDO1FBRUYsUUFBUSxRQUFRLEVBQUU7WUFDaEIsS0FBSyxvQkFBUSxDQUFDLEtBQUs7Z0JBQ2pCLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRyxNQUFNO1lBQ1IsS0FBSyxvQkFBUSxDQUFDLElBQUk7Z0JBQ2hCLFVBQVUsQ0FBQyxHQUFHLENBQUMsbUJBQ2IsSUFBSSxFQUFFLE9BQU8sRUFDYixPQUFPLElBQ0osVUFBVSxDQUNkLENBQUM7Z0JBQ0YsTUFBTTtZQUNSO2dCQUNFLE1BQU0sSUFBSSw2QkFBb0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1NBQzVFO1FBRUQsT0FBTztLQUNSO0lBRUQsZ0RBQWdEO0lBQ2hELElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sSUFBSSxLQUFLLFVBQVUsRUFBRTtRQUMvRCxNQUFNLElBQUkseUJBQWdCLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUM3QztJQUVELE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7SUFFbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsRUFBRTtRQUN4QyxnRUFBZ0U7UUFDaEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDOUIsSUFBSSxJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxvQkFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUM1RCxVQUFVLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQVMsVUFBVSxDQUFDLENBQUMsc0NBQXNDO29CQUN6RixxRkFBcUY7cUJBQ3BGLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUU7b0JBQzVCLHFEQUFxRDtvQkFDckQsNkZBQTZGO29CQUM3RixpQ0FBaUM7b0JBQ2pDLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxFQUFFO3dCQUNqQyxNQUFNLElBQUksMkJBQWtCLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxTQUFTLENBQUMsQ0FBQztxQkFDcEU7b0JBRUQsT0FBTyxTQUFTLENBQUM7Z0JBQ25CLENBQUMsQ0FBQyxDQUFDO2FBQ047aUJBQU0sSUFBSSxJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxvQkFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUNuRSxVQUFVLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQWtCLFVBQVUsQ0FBQyxDQUFDLHNDQUFzQztvQkFDbEcsb0RBQW9EO29CQUNwRCwyRUFBMkU7cUJBQzFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRTtvQkFDeEMsNkZBQTZGO29CQUM3RixpQ0FBaUM7b0JBQ2pDLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7d0JBQ2xHLGlEQUFpRDt3QkFDakQsTUFBTSxJQUFJLDJCQUFrQixDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLE9BQU8sU0FBUyxDQUFDLENBQUM7cUJBQ3BFO29CQUVELE9BQU8sT0FBTyxTQUFTLEtBQUssUUFBUSxDQUFDO2dCQUN2QyxDQUFDLENBQUM7cUJBQ0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRTtvQkFDNUIsc0RBQXNEO29CQUN0RCxJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsRUFBRTt3QkFDakMsTUFBTSxJQUFJLDJCQUFrQixDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLE9BQU8sU0FBUyxDQUFDLENBQUM7cUJBQ3BFO29CQUVELE9BQU8sU0FBUyxDQUFDO2dCQUNuQixDQUFDLENBQUMsQ0FBQzthQUNOO2lCQUFNO2dCQUNMLGdFQUFnRTtnQkFDaEUsdUdBQXVHO2dCQUN2RyxNQUFNLElBQUksNkJBQW9CLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNqRDtTQUNGO0tBQ0Y7SUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFBRTtRQUN0RCxVQUFVLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDeEUsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsT0FBTyxVQUFVLENBQUMsYUFBYSxDQUFDO0tBQ2pDO0lBRUQ7UUFDRSxJQUFJLFFBQVEsR0FBYSxLQUFLLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFaEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDekIsa0VBQWtFO1lBQ2xFLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNuRjtRQUVELFFBQVEsR0FBRyxLQUFLLENBQUMscUJBQXFCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFbkQsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDekIsbUVBQW1FO1lBQ25FLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNwRjtRQUVELFFBQVEsR0FBRyxLQUFLLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFbEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDekIsa0VBQWtFO1lBQ2xFLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNuRjtRQUVELFFBQVEsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2xELDBEQUEwRDtZQUMxRCxLQUFLLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDbEY7S0FDRjtJQUVELGdEQUFnRDtJQUNoRCxNQUFNLFdBQVcsR0FBRyxjQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUVyRCxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDM0IsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRTtZQUM5QixLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUM5QjtRQUVELFFBQVEsUUFBUSxFQUFFO1lBQ2hCLEtBQUssb0JBQVEsQ0FBQyxLQUFLO2dCQUNqQixVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFFdkUsT0FBTztZQUNULEtBQUssb0JBQVEsQ0FBQyxHQUFHO2dCQUNmLElBQUksTUFBK0IsQ0FBQztnQkFDcEMsSUFBSSxTQUEwQyxDQUFDO2dCQUUvQywyQ0FBMkM7Z0JBQzNDLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUMxQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsb0JBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQ2hGLHNHQUFzRztvQkFDdEcsU0FBUyxHQUFHLEtBQUssQ0FBQyxlQUFlLGlDQUFNLE1BQU0sQ0FBQyxLQUFLLEtBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEtBQUksSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDaEc7cUJBQU07b0JBQ0wsTUFBTSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQ3pELFNBQVMsbUNBQVEsTUFBTSxDQUFDLEtBQUssS0FBRSxJQUFJLEVBQUUsSUFBSSxHQUFFLENBQUM7aUJBQzdDO2dCQUVELFVBQVUsQ0FBQyxHQUFHLENBQUMsbUNBQ1YsTUFBTSxDQUFDLEtBQUssS0FDZixJQUFJLEVBQUUsR0FBRyxFQUNULEVBQUUsb0JBQU8sU0FBUyxJQUNuQixDQUFDO2dCQUVGLE9BQU87WUFDVCxLQUFLLG9CQUFRLENBQUMsSUFBSTtnQkFDaEIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxtQ0FDVixVQUFVLEtBQ2IsSUFBSSxFQUFFLElBQUksR0FDWCxDQUFDO2dCQUVGLE9BQU87WUFDVDtnQkFDRSxNQUFNLElBQUksNkJBQW9CLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUscUJBQXFCLENBQUMsQ0FBQztTQUM5RTtLQUNGO0lBRUQsZ0dBQWdHO0lBQ2hHLG1EQUFtRDtJQUNuRCxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7UUFDeEMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0Isb0JBQU0sQ0FBQyxJQUFJLENBQ1QsNklBQTZJLENBQzlJLENBQUM7UUFDRixVQUFVLENBQUMsR0FBRyxDQUFDLG1DQUNWLFVBQVUsS0FDYixJQUFJLEVBQUUsb0JBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FDbEMsQ0FBQztRQUVGLE9BQU87S0FDUjtJQUVELE1BQU0sYUFBYSxHQUFHLElBQUEsdUJBQVcsRUFBQyxJQUFJLENBQUMsQ0FBQztJQUN4QyxRQUFRLFFBQVEsRUFBRTtRQUNoQixLQUFLLG9CQUFRLENBQUMsS0FBSztZQUNqQixVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFdEYsT0FBTztRQUNULEtBQUssb0JBQVEsQ0FBQyxHQUFHO1lBQ2Ysd0RBQXdEO1lBQ3hELElBQUksS0FBSyxJQUFJLFVBQVUsRUFBRTtnQkFDdkIsb0JBQU0sQ0FBQyxLQUFLLENBQUMsbUNBQW1DLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUU3RCxNQUFNLEtBQXFCLEtBQUssQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUF4RixFQUFFLElBQUksT0FBa0YsRUFBN0UsS0FBSywyQkFBaEIsUUFBa0IsQ0FBc0UsQ0FBQztnQkFFL0YsVUFBVSxDQUFDLEdBQUcsQ0FBQyxtQ0FDVixLQUFLLEtBQ1IsSUFBSSxFQUFFLEdBQUcsRUFDVCxFQUFFLEVBQUUsSUFBSSxHQUNULENBQUM7Z0JBRUYsT0FBTzthQUNSO1lBRUQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFOUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxtQ0FDVixNQUFNLENBQUMsS0FBSyxLQUNmLElBQUksRUFBRSxHQUFHLEVBQ1QsRUFBRSxrQkFBSSxJQUFJLEVBQUUsYUFBYSxJQUFLLE1BQU0sQ0FBQyxLQUFLLElBQzNDLENBQUM7WUFFRixPQUFPO1FBQ1QsS0FBSyxvQkFBUSxDQUFDLElBQUk7WUFDaEIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxtQ0FDVixVQUFVLEtBQ2IsSUFBSSxFQUFFLGFBQWEsR0FDcEIsQ0FBQztZQUVGLE9BQU87UUFDVDtZQUNFLE1BQU0sSUFBSSw2QkFBb0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0tBQzlFO0FBQ0gsQ0FBQztBQXhhRCxrQ0F3YUM7QUFFRCw0RUFBNEU7QUFDNUU7OztHQUdHO0FBQ0gsOENBQThDO0FBRTlDOzs7R0FHRztBQUNILFNBQVMsY0FBYyxDQUFDLElBQVM7SUFDL0Isb0JBQU0sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUVuQyxJQUNFLElBQUksS0FBSyxLQUFLO1FBQ2QsSUFBSSxLQUFLLG9CQUFRLENBQUMsS0FBSyxDQUFDLEtBQUs7UUFDN0IsSUFBSSxLQUFLLG9CQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLO1FBQ3BDLElBQUksS0FBSyxvQkFBUSxDQUFDLEtBQUssQ0FBQyxhQUFhO1FBQ3JDLElBQUksS0FBSyxvQkFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUM1QztRQUNBLE9BQU8sb0JBQVEsQ0FBQyxLQUFLLENBQUM7S0FDdkI7SUFDRCxJQUFJLElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxLQUFLLG9CQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxJQUFJLEtBQUssb0JBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtRQUNyRixPQUFPLG9CQUFRLENBQUMsR0FBRyxDQUFDO0tBQ3JCO0lBRUQsT0FBTyxvQkFBUSxDQUFDLElBQUksQ0FBQztBQUN2QixDQUFDIn0=