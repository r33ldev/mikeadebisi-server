import * as mongoose from 'mongoose';
import type { AnyParamConstructor, DeferredFunc, Func, GetTypeReturn, IModelOptions, IObjectWithTypegooseFunction, IObjectWithTypegooseName, IPrototype, KeyStringAny, MappedInnerOuterOptions, PropOptionsForNumber, PropOptionsForString, VirtualOptions } from '../types';
import { DecoratorKeys, PropType } from './constants';
/**
 * Returns true, if the type is included in mongoose.Schema.Types
 * @param Type The Type to test
 * @returns true, if it includes it
 */
export declare function isPrimitive(Type: any): boolean;
/**
 * Returns true, if the type is included in mongoose.Schema.Types except the aliases
 * @param Type The Type to test
 * @returns true, if it includes it
 */
export declare function isAnRefType(Type: any): boolean;
/**
 * Returns true, if it is an Object
 * Looks down the prototype chain, unless "once" is set to "true"
 * @param Type The Type to test
 * @param once Set to not loop down the prototype chain, default "false"
 * @returns true, if it is an Object
 */
export declare function isObject(Type: any, once?: boolean): boolean;
/**
 * Returns true, if it is an Number
 * @param Type The Type to test
 * @returns true, if it is an Number
 */
export declare function isNumber(Type: any): Type is number;
/**
 * Returns true, if it is an String
 * @param Type The Type to test
 * @returns true, if it is an String
 */
export declare function isString(Type: any): Type is string;
/**
 * Generate the inital values for the property to be extended upon
 * @param name Name of the current Model/Class
 * @param key Key of the property
 * @param proptype Type of the Property
 */
export declare function initProperty(name: string, key: string, proptype: PropType): {
    [path: string]: mongoose.SchemaDefinitionProperty<undefined>;
};
/**
 * Get the Class for a given Document
 * @param document The Document to fetch the class from
 */
export declare function getClassForDocument(document: mongoose.Document): NewableFunction | undefined;
/**
 * Get the Class for a number of inputs
 * @param input The Input to fetch the class from
 */
export declare function getClass(input: (mongoose.Document & IObjectWithTypegooseFunction) | (mongoose.Schema.Types.Subdocument & IObjectWithTypegooseFunction) | string | IObjectWithTypegooseName | any): NewableFunction | undefined;
/**
 * Returns all options found in "options" that are String-validate related
 * @param options The raw Options that may contain the wanted options
 */
export declare function isWithStringValidate(options: PropOptionsForString): string[];
/**
 * Returns all options found in "options" that are String-transform related
 * @param options The raw Options
 */
export declare function isWithStringTransform(options: PropOptionsForString): string[];
/**
 * Returns all options found in "options" that are Number-Validate related
 * @param options The raw Options
 */
export declare function isWithNumberValidate(options: PropOptionsForNumber): string[];
/**
 * Returns all options found in "options" that are Enum Related
 * @param options The raw Options
 */
export declare function isWithEnumValidate(options: PropOptionsForNumber | PropOptionsForString): string[];
/**
 * Check if the "options" contain any Virtual-Populate related options (excluding "ref" by it self)
 * @param options The raw Options
 */
export declare function isWithVirtualPOP(options: Partial<VirtualOptions>): boolean;
export declare const allVirtualoptions: string[];
/**
 * Check if all Required options for Virtual-Populate are included in "options"
 * @param options The raw Options
 */
export declare function includesAllVirtualPOP(options: Partial<VirtualOptions>): options is VirtualOptions;
/**
 * Merge "value" with existing Metadata and save it to the class
 * Difference with "mergeMetadata" is that this one DOES save it to the class
 * Overwrites any existing Metadata that is new in "value"
 * @param key Metadata key to read from and assign the new value to
 * @param value Options to merge with
 * @param cl The Class to read and assign the new metadata to
 * @internal
 */
export declare function assignMetadata(key: DecoratorKeys, value: unknown, cl: AnyParamConstructor<any>): any;
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
export declare function mergeMetadata<T = any>(key: DecoratorKeys, value: unknown, cl: AnyParamConstructor<any>): T;
/**
 * Merge only schemaOptions from ModelOptions of the class
 * @param value The value to use
 * @param cl The Class to get the values from
 */
export declare function mergeSchemaOptions<U extends AnyParamConstructor<any>>(value: mongoose.SchemaOptions | undefined, cl: U): mongoose.SchemaOptions<"type", unknown, {}, {}, {}, {}> | undefined;
/**
 * Tries to return the right target
 * if target.constructor.name is "Function", return "target", otherwise "target.constructor"
 * @param target The target to determine
 */
export declare function getRightTarget(target: any): any;
/**
 * Get the Class's final name
 * (combines all available options to generate a name)
 * @param cl The Class to get the name for
 * @param overwriteOptions Overwrite ModelOptions to generate a name from (Only name related options are merged)
 */
export declare function getName<U extends AnyParamConstructor<any>>(cl: U, overwriteOptions?: IModelOptions): string;
/**
 * Check if "Type" is a class and if it is already in "schemas"
 * @param Type The Type to check
 */
export declare function isNotDefined(Type: any): boolean;
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
export declare function mapArrayOptions(rawOptions: any, Type: AnyParamConstructor<any> | mongoose.Schema, target: any, pkey: string, loggerType?: AnyParamConstructor<any>, extraInner?: KeyStringAny): mongoose.SchemaTypeOptions<any>;
/**
 * Map Options to "inner" & "outer"
 * @param rawOptions The raw options
 * @param Type The Type of the array
 * @param target The Target class
 * @param pkey Key of the Property
 * @param loggerType Type to use for logging
 */
export declare function mapOptions(rawOptions: any, Type: AnyParamConstructor<any> | (mongoose.Schema & IPrototype), target: any, pkey: string, loggerType?: AnyParamConstructor<any>): MappedInnerOuterOptions;
/**
 * Check if the current Type is meant to be a Array
 * @param rawOptions The raw options
 */
export declare function isTypeMeantToBeArray(rawOptions: any): boolean;
/**
 * Warn, Error or Allow if an mixed type is set
 * -> this function exists for de-duplication
 * @param target Target Class
 * @param key Property key
 */
export declare function warnMixed(target: any, key: string): void | never;
/**
 * Check if "val" is "null" to "undefined"
 * This Function exists because since node 4.0.0 the internal util.is* functions got deprecated
 * @param val Any value to test if null or undefined
 */
export declare function isNullOrUndefined(val: unknown): val is null | undefined;
/**
 * Assign Global ModelOptions if not already existing
 * @param target Target Class
 */
export declare function assignGlobalModelOptions(target: any): void;
/**
 * Loop over "dimensions" and create an array from that
 * @param rawOptions baseProp's rawOptions
 * @param extra What is actually in the deepest array
 * @param name name of the target for better error logging
 * @param key key of target-key for better error logging
 */
export declare function createArrayFromDimensions(rawOptions: any, extra: any, name: string, key: string): any[];
/**
 * Assert a condition, if "false" throw error
 * Note: it is not named "assert" to differentiate between node and jest types
 *
 * Note: "error" can be a function to not execute the constructor when not needed
 * @param cond The Condition to check
 * @param error A Custom Error to throw or a function that returns a Error
 */
export declare function assertion(cond: any, error?: Error | DeferredFunc<Error>): asserts cond;
/**
 * Assert if "val" is an function (constructor for classes)
 * @param val Value to test
 */
export declare function assertionIsClass(val: any): asserts val is Func;
/**
 * Get Type, if input is an arrow-function, execute it and return the result
 * @param typeOrFunc Function or Type
 * @param returnLastFoundArray Return the last found array (used for something like PropOptions.discriminators)
 */
export declare function getType(typeOrFunc: Func | any, returnLastFoundArray?: boolean): GetTypeReturn;
/**
 * Is the provided input an class with an constructor?
 * @param obj The Value to test
 */
export declare function isConstructor(obj: any): obj is AnyParamConstructor<any>;
/**
 * Logs an warning if "included > 0" that the options of not the current type are included
 * @param name Name of the Class
 * @param key Name of the Currently Processed key
 * @param type Name of the Expected Type
 * @param extra Extra string to be included
 * @param included Included Options to be listed
 */
export declare function warnNotCorrectTypeOptions(name: string, key: string, type: string, extra: string, included: string[]): void;
/**
 * Try to convert input "value" to a String, without it failing
 * @param value The Value to convert to String
 * @returns A String, either "value.toString" or a placeholder
 */
export declare function toStringNoFail(value: unknown): string;
