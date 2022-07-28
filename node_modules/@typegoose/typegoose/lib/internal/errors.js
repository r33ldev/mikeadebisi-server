"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoDiscriminatorFunctionError = exports.PathNotInSchemaError = exports.InvalidOptionsConstructorError = exports.InvalidEnumTypeError = exports.ExpectedTypeError = exports.ResolveTypegooseNameError = exports.OptionDoesNotSupportOptionError = exports.StringLengthExpectedError = exports.FunctionCalledMoreThanSupportedError = exports.NotValidModelError = exports.RefOptionIsUndefinedError = exports.SelfContainingClassError = exports.CannotBeSymbolError = exports.InvalidWhatIsItError = exports.InvalidPropTypeError = exports.AssertionFallbackError = exports.NoValidClassError = exports.NotAllVPOPElementsError = exports.NotStringTypeError = exports.NotNumberTypeError = exports.InvalidTypeError = void 0;
const utils_1 = require("./utils");
// Note: dont forget to use "toStringNoFail" on values that are "unknown" or "any"
class InvalidTypeError extends Error {
    constructor(targetName, key, Type) {
        super(`"${targetName}.${key}"'s Type is invalid! Type is: "${(0, utils_1.toStringNoFail)(Type)}" [E009]`);
    }
}
exports.InvalidTypeError = InvalidTypeError;
class NotNumberTypeError extends Error {
    constructor(targetName, key, enumKey, enumValue) {
        super(`Typeof "${targetName}.${key}" is "Number", value is undefined/null or does not have a reverse mapping! [E011]\n` +
            `  Encountered with property: "${enumKey}.${typeof enumValue}"`);
    }
}
exports.NotNumberTypeError = NotNumberTypeError;
class NotStringTypeError extends Error {
    constructor(targetName, key, enumKey, enumValue) {
        super(`Typeof "${targetName}.${key}" is "String", used enum is not only Strings! [E010]\n` +
            `  Encountered with property in Enum: "${enumKey}.${typeof enumValue}"`);
    }
}
exports.NotStringTypeError = NotStringTypeError;
/** Not All Virtual Populate Elements Error */
class NotAllVPOPElementsError extends Error {
    constructor(name, key) {
        super(`"${name}.${key}" has not all needed Virtual Populate Options! Needed are: ${utils_1.allVirtualoptions.join(', ')} [E006]`);
    }
}
exports.NotAllVPOPElementsError = NotAllVPOPElementsError;
class NoValidClassError extends TypeError {
    constructor(value) {
        super('Value is not a function or does not have a constructor! [E028]\n' + `Value: "${(0, utils_1.toStringNoFail)(value)}"`);
    }
}
exports.NoValidClassError = NoValidClassError;
class AssertionFallbackError extends Error {
    constructor() {
        super('Assert failed - no custom error [E019]');
    }
}
exports.AssertionFallbackError = AssertionFallbackError;
/** Error for when an unknown PropType is passed to an switch, gets thrown in the default case */
class InvalidPropTypeError extends Error {
    constructor(proptype, name, key, where) {
        super(`"${(0, utils_1.toStringNoFail)(proptype)}"(${where}) is invalid for "${name}.${key}" [E013]`);
    }
}
exports.InvalidPropTypeError = InvalidPropTypeError;
// For Backwards-compatability
/** @deprecated This was renamed to "InvalidPropTypeError" and will be removed in 10.0 */
exports.InvalidWhatIsItError = InvalidPropTypeError;
class CannotBeSymbolError extends Error {
    constructor(name, key) {
        super(`A property key in Typegoose cannot be an symbol! ("${name}.${(0, utils_1.toStringNoFail)(key)}") [E024]`);
    }
}
exports.CannotBeSymbolError = CannotBeSymbolError;
class SelfContainingClassError extends TypeError {
    constructor(name, key) {
        super('It seems like the type used is the same as the target class, which is not supported\n' +
            `Please look at https://github.com/typegoose/typegoose/issues/42 for more information ("${name}.${key}") [E004]`);
    }
}
exports.SelfContainingClassError = SelfContainingClassError;
class RefOptionIsUndefinedError extends Error {
    constructor(name, key) {
        super(`Prop-Option "ref"'s value is "null" or "undefined" for "${name}.${key}" [E005]`);
    }
}
exports.RefOptionIsUndefinedError = RefOptionIsUndefinedError;
class NotValidModelError extends TypeError {
    constructor(model, where) {
        super(`Expected "${where}" to be a valid mongoose.Model! (got: "${(0, utils_1.toStringNoFail)(model)}") [E025]`);
    }
}
exports.NotValidModelError = NotValidModelError;
class FunctionCalledMoreThanSupportedError extends Error {
    constructor(functionName, supported, extra) {
        super(`Function "${functionName}" only supports to be called "${supported}" times with the same parameters [E003]\n${extra}`);
    }
}
exports.FunctionCalledMoreThanSupportedError = FunctionCalledMoreThanSupportedError;
class StringLengthExpectedError extends TypeError {
    constructor(length, got, where, valueName) {
        // create the "got:" message, when string say it was a string, but not the length
        // if not string, then say it is not a string plus the value
        const gotMessage = typeof got === 'string' ? `(String: "${got.length}")` : `(not-String: "${(0, utils_1.toStringNoFail)(got)}")`;
        super(`Expected "${valueName}" to have at least length of "${length}" (got: ${gotMessage}, where: "${where}") [E026]`);
    }
}
exports.StringLengthExpectedError = StringLengthExpectedError;
class OptionDoesNotSupportOptionError extends TypeError {
    constructor(currentOption, problemOption, expected, provided) {
        super(`The Option "${currentOption}" does not support Option "${problemOption}" other than "${expected}" (provided was: "${provided}") [E027]`);
    }
}
exports.OptionDoesNotSupportOptionError = OptionDoesNotSupportOptionError;
class ResolveTypegooseNameError extends ReferenceError {
    constructor(input) {
        super('Input was not a string AND didnt have a .typegooseName function AND didnt have a .typegooseName string [E014]\n' +
            `Value: "${(0, utils_1.toStringNoFail)(input)}"`);
    }
}
exports.ResolveTypegooseNameError = ResolveTypegooseNameError;
class ExpectedTypeError extends TypeError {
    constructor(optionName, expected, got) {
        super(`Expected Argument "${optionName}" to have type "${expected}", got: "${(0, utils_1.toStringNoFail)(got)}" [E029]`);
    }
}
exports.ExpectedTypeError = ExpectedTypeError;
class InvalidEnumTypeError extends TypeError {
    constructor(name, key, value) {
        super(`Invalid Type used for options "enum" at "${name}.${key}"! [E012]\n` +
            `Type: "${(0, utils_1.toStringNoFail)(value)}"\n` +
            'https://typegoose.github.io/typegoose/docs/guides/error-warning-details#invalid-type-for-enum-e012');
    }
}
exports.InvalidEnumTypeError = InvalidEnumTypeError;
class InvalidOptionsConstructorError extends TypeError {
    constructor(name, key, type) {
        super(`Type has a invalid "OptionsConstructor" on "${name}.${key}"! [E016]\n` + `Type: "${(0, utils_1.toStringNoFail)(type)}"`);
    }
}
exports.InvalidOptionsConstructorError = InvalidOptionsConstructorError;
class PathNotInSchemaError extends Error {
    constructor(name, key) {
        super(`Path "${key}" on "${name}" does not exist in the Schema! [E030]`);
    }
}
exports.PathNotInSchemaError = PathNotInSchemaError;
class NoDiscriminatorFunctionError extends Error {
    constructor(name, key) {
        super(`Path "${name}.${key}" does not have a function called "discriminator"! (Nested Discriminator cannot be applied) [E031]`);
    }
}
exports.NoDiscriminatorFunctionError = NoDiscriminatorFunctionError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFsL2Vycm9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBNEQ7QUFFNUQsa0ZBQWtGO0FBRWxGLE1BQWEsZ0JBQWlCLFNBQVEsS0FBSztJQUN6QyxZQUFZLFVBQWtCLEVBQUUsR0FBVyxFQUFFLElBQWE7UUFDeEQsS0FBSyxDQUFDLElBQUksVUFBVSxJQUFJLEdBQUcsa0NBQWtDLElBQUEsc0JBQWMsRUFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDL0YsQ0FBQztDQUNGO0FBSkQsNENBSUM7QUFFRCxNQUFhLGtCQUFtQixTQUFRLEtBQUs7SUFDM0MsWUFBWSxVQUFrQixFQUFFLEdBQVcsRUFBRSxPQUFlLEVBQUUsU0FBaUI7UUFDN0UsS0FBSyxDQUNILFdBQVcsVUFBVSxJQUFJLEdBQUcscUZBQXFGO1lBQy9HLGlDQUFpQyxPQUFPLElBQUksT0FBTyxTQUFTLEdBQUcsQ0FDbEUsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQVBELGdEQU9DO0FBRUQsTUFBYSxrQkFBbUIsU0FBUSxLQUFLO0lBQzNDLFlBQVksVUFBa0IsRUFBRSxHQUFXLEVBQUUsT0FBZSxFQUFFLFNBQWlCO1FBQzdFLEtBQUssQ0FDSCxXQUFXLFVBQVUsSUFBSSxHQUFHLHdEQUF3RDtZQUNsRix5Q0FBeUMsT0FBTyxJQUFJLE9BQU8sU0FBUyxHQUFHLENBQzFFLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFQRCxnREFPQztBQUVELDhDQUE4QztBQUM5QyxNQUFhLHVCQUF3QixTQUFRLEtBQUs7SUFDaEQsWUFBWSxJQUFZLEVBQUUsR0FBVztRQUNuQyxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksR0FBRyw4REFBOEQseUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM1SCxDQUFDO0NBQ0Y7QUFKRCwwREFJQztBQUVELE1BQWEsaUJB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