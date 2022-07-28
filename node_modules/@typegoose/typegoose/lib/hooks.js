"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = exports.Pre = exports.post = exports.pre = void 0;
const constants_1 = require("./internal/constants");
const errors_1 = require("./internal/errors");
const utils_1 = require("./internal/utils");
const logSettings_1 = require("./logSettings");
// TSDoc for the hooks can't be added without adding it to *every* overload
const hooks = {
    pre(...args) {
        return (target) => addToHooks(target, 'pre', args);
    },
    post(...args) {
        return (target) => addToHooks(target, 'post', args);
    },
};
/**
 * Add a hook to the hooks Array
 * @param target Target Class
 * @param hookType What type is it
 * @param args All Arguments, that should be passed-throught
 */
function addToHooks(target, hookType, args) {
    var _a, _b, _c;
    // Convert Method to array if only a string is provided
    const methods = Array.isArray(args[0]) ? args[0] : [args[0]];
    const func = args[1];
    const hookOptions = (_a = args[2]) !== null && _a !== void 0 ? _a : {};
    (0, utils_1.assertion)(typeof func === 'function', () => new errors_1.ExpectedTypeError('fn', 'function', func));
    (0, utils_1.assertion)(typeof hookOptions === 'object' && !(0, utils_1.isNullOrUndefined)(hookOptions), () => new errors_1.ExpectedTypeError('options', 'object / undefined', hookOptions));
    if (args.length > 3) {
        logSettings_1.logger.warn(`"addToHooks" parameter "args" has a length of over 3 (length: ${args.length})`);
    }
    logSettings_1.logger.info('Adding hooks for "[%s]" to "%s" as type "%s"', methods.join(','), (0, utils_1.getName)(target), hookType);
    for (const method of methods) {
        switch (hookType) {
            case 'post':
                const postHooks = Array.from((_b = Reflect.getMetadata(constants_1.DecoratorKeys.HooksPost, target)) !== null && _b !== void 0 ? _b : []);
                postHooks.push({ func, method, options: hookOptions });
                Reflect.defineMetadata(constants_1.DecoratorKeys.HooksPost, postHooks, target);
                break;
            case 'pre':
                const preHooks = Array.from((_c = Reflect.getMetadata(constants_1.DecoratorKeys.HooksPre, target)) !== null && _c !== void 0 ? _c : []);
                preHooks.push({ func, method, options: hookOptions });
                Reflect.defineMetadata(constants_1.DecoratorKeys.HooksPre, preHooks, target);
                break;
        }
    }
}
exports.pre = hooks.pre;
exports.post = hooks.post;
// Export it PascalCased
exports.Pre = hooks.pre;
exports.Post = hooks.post;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9va3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaG9va3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0Esb0RBQXFEO0FBQ3JELDhDQUFzRDtBQUN0RCw0Q0FBeUU7QUFDekUsK0NBQXVDO0FBNEZ2QywyRUFBMkU7QUFDM0UsTUFBTSxLQUFLLEdBQVU7SUFDbkIsR0FBRyxDQUFDLEdBQUcsSUFBSTtRQUNULE9BQU8sQ0FBQyxNQUFXLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFDRCxJQUFJLENBQUMsR0FBRyxJQUFJO1FBQ1YsT0FBTyxDQUFDLE1BQVcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0QsQ0FBQztDQUNGLENBQUM7QUFFRjs7Ozs7R0FLRztBQUNILFNBQVMsVUFBVSxDQUFDLE1BQVcsRUFBRSxRQUF3QixFQUFFLElBQVc7O0lBQ3BFLHVEQUF1RDtJQUN2RCxNQUFNLE9BQU8sR0FBVSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEUsTUFBTSxJQUFJLEdBQWdCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQyxNQUFNLFdBQVcsR0FBc0IsTUFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLG1DQUFJLEVBQUUsQ0FBQztJQUVyRCxJQUFBLGlCQUFTLEVBQUMsT0FBTyxJQUFJLEtBQUssVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksMEJBQWlCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzNGLElBQUEsaUJBQVMsRUFDUCxPQUFPLFdBQVcsS0FBSyxRQUFRLElBQUksQ0FBQyxJQUFBLHlCQUFpQixFQUFDLFdBQVcsQ0FBQyxFQUNsRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLDBCQUFpQixDQUFDLFNBQVMsRUFBRSxvQkFBb0IsRUFBRSxXQUFXLENBQUMsQ0FDMUUsQ0FBQztJQUVGLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDbkIsb0JBQU0sQ0FBQyxJQUFJLENBQUMsaUVBQWlFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0tBQzlGO0lBRUQsb0JBQU0sQ0FBQyxJQUFJLENBQUMsOENBQThDLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFBLGVBQU8sRUFBQyxNQUFNLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUUxRyxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtRQUM1QixRQUFRLFFBQVEsRUFBRTtZQUNoQixLQUFLLE1BQU07Z0JBQ1QsTUFBTSxTQUFTLEdBQWtCLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBQSxPQUFPLENBQUMsV0FBVyxDQUFDLHlCQUFhLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxtQ0FBSSxFQUFFLENBQUMsQ0FBQztnQkFDeEcsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZELE9BQU8sQ0FBQyxjQUFjLENBQUMseUJBQWEsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNuRSxNQUFNO1lBQ1IsS0FBSyxLQUFLO2dCQUNSLE1BQU0sUUFBUSxHQUFrQixLQUFLLENBQUMsSUFBSSxDQUFDLE1BQUEsT0FBTyxDQUFDLFdBQVcsQ0FBQyx5QkFBYSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsbUNBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3RHLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO2dCQUN0RCxPQUFPLENBQUMsY0FBYyxDQUFDLHlCQUFhLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDakUsTUFBTTtTQUNUO0tBQ0Y7QUFDSCxDQUFDO0FBRVksUUFBQSxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztBQUNoQixRQUFBLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBRS9CLHdCQUF3QjtBQUNYLFFBQUEsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDaEIsUUFBQSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyJ9