import * as mongoose from 'mongoose';
import type { AnyParamConstructor, IModelOptions } from '../types';
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
export declare function _buildSchema<U extends AnyParamConstructor<any>>(cl: U, origSch?: mongoose.Schema<any>, opt?: mongoose.SchemaOptions, isFinalSchema?: boolean, overwriteOptions?: IModelOptions): mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, "type", {
    [x: string]: any;
}>;
