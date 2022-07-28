"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Index = exports.index = void 0;
const constants_1 = require("./internal/constants");
const utils_1 = require("./internal/utils");
const logSettings_1 = require("./logSettings");
/**
 * Defines a index for this Class which will then be added to the Schema.
 * @param fields Which fields to index (if multiple fields are set, it will be a compound index)
 * @param options Options to pass to MongoDB driver's createIndex() function
 * @example Example:
 * ```ts
 * @index({ article: 1, user: 1 }, { unique: true })
 * class ClassName {}
 * ```
 */
function index(fields, options) {
    return (target) => {
        var _a;
        logSettings_1.logger.info('Adding "%o" Indexes to %s', { fields, options }, (0, utils_1.getName)(target));
        const indices = Array.from((_a = Reflect.getMetadata(constants_1.DecoratorKeys.Index, target)) !== null && _a !== void 0 ? _a : []);
        indices.push({ fields, options });
        Reflect.defineMetadata(constants_1.DecoratorKeys.Index, indices, target);
    };
}
exports.index = index;
exports.Index = index;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0Esb0RBQXFEO0FBQ3JELDRDQUEyQztBQUMzQywrQ0FBdUM7QUFHdkM7Ozs7Ozs7OztHQVNHO0FBQ0gsU0FBZ0IsS0FBSyxDQUFvQyxNQUFnQyxFQUFFLE9BQXlCO0lBQ2xILE9BQU8sQ0FBQyxNQUFXLEVBQUUsRUFBRTs7UUFDckIsb0JBQU0sQ0FBQyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUUsSUFBQSxlQUFPLEVBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMvRSxNQUFNLE9BQU8sR0FBa0IsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFBLE9BQU8sQ0FBQyxXQUFXLENBQUMseUJBQWEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLG1DQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2xHLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNsQyxPQUFPLENBQUMsY0FBYyxDQUFDLHlCQUFhLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMvRCxDQUFDLENBQUM7QUFDSixDQUFDO0FBUEQsc0JBT0M7QUFHaUIsc0JBQUsifQ==