"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isModel = exports.isRefTypeArray = exports.isRefType = exports.isDocumentArray = exports.isDocument = void 0;
const mongoose = require("mongoose");
const utils_1 = require("./internal/utils");
const logSettings_1 = require("./logSettings");
/**
 * Check if the given document is populated
 * @param doc The Ref with uncertain type
 */
function isDocument(doc) {
    return doc instanceof mongoose.Model;
}
exports.isDocument = isDocument;
function isDocumentArray(docs) {
    // its "any" & "unkown" because this is not listed as an overload
    return Array.isArray(docs) && docs.every((v) => isDocument(v));
}
exports.isDocumentArray = isDocumentArray;
/**
 * Check if the document is of type "refType"
 * @param doc The Ref with uncretain type
 * @param refType The Expected Reference Type (this is required because this type is only known at compile time, not at runtime)
 */
function isRefType(doc, refType) {
    logSettings_1.logger.info('isRefType:', refType);
    if ((0, utils_1.isNullOrUndefined)(doc) || isDocument(doc)) {
        return false;
    }
    // this "ObjectId" test is in the front, because its the most common - to lower resource use
    if (refType === mongoose.Types.ObjectId) {
        return doc instanceof mongoose.Types.ObjectId;
    }
    if (refType === String) {
        return typeof doc === 'string';
    }
    if (refType === Number) {
        return typeof doc === 'number';
    }
    if (refType === Buffer || refType === mongoose.Types.Buffer) {
        return doc instanceof Buffer;
    }
    return false;
}
exports.isRefType = isRefType;
function isRefTypeArray(docs, refType) {
    // its "any" & "unkown" because this is not listed as an overload
    return Array.isArray(docs) && docs.every((v) => isRefType(v, refType));
}
exports.isRefTypeArray = isRefTypeArray;
/**
 * Check if the input is a mongoose.Model
 * @param model The Value to check
 */
function isModel(model) {
    return (model === null || model === void 0 ? void 0 : model.prototype) instanceof mongoose.Model;
}
exports.isModel = isModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZWd1YXJkcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90eXBlZ3VhcmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFxQztBQUNyQyw0Q0FBcUQ7QUFDckQsK0NBQXVDO0FBR3ZDOzs7R0FHRztBQUNILFNBQWdCLFVBQVUsQ0FBdUIsR0FBYztJQUM3RCxPQUFPLEdBQUcsWUFBWSxRQUFRLENBQUMsS0FBSyxDQUFDO0FBQ3ZDLENBQUM7QUFGRCxnQ0FFQztBQWdCRCxTQUFnQixlQUFlLENBQUMsSUFBaUM7SUFDL0QsaUVBQWlFO0lBQ2pFLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRSxDQUFDO0FBSEQsMENBR0M7QUFJRDs7OztHQUlHO0FBQ0gsU0FBZ0IsU0FBUyxDQUF1QixHQUEwQixFQUFFLE9BQXdCO0lBQ2xHLG9CQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUVuQyxJQUFJLElBQUEseUJBQWlCLEVBQUMsR0FBRyxDQUFDLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQzdDLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFFRCw0RkFBNEY7SUFDNUYsSUFBSSxPQUFPLEtBQUssUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7UUFDdkMsT0FBTyxHQUFHLFlBQVksUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7S0FDL0M7SUFDRCxJQUFJLE9BQU8sS0FBSyxNQUFNLEVBQUU7UUFDdEIsT0FBTyxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUM7S0FDaEM7SUFDRCxJQUFJLE9BQU8sS0FBSyxNQUFNLEVBQUU7UUFDdEIsT0FBTyxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUM7S0FDaEM7SUFDRCxJQUFJLE9BQU8sS0FBSyxNQUFNLElBQUksT0FBTyxLQUFLLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO1FBQzNELE9BQU8sR0FBRyxZQUFZLE1BQU0sQ0FBQztLQUM5QjtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQXRCRCw4QkFzQkM7QUFtQkQsU0FBZ0IsY0FBYyxDQUFDLElBQWlDLEVBQUUsT0FBd0I7SUFDeEYsaUVBQWlFO0lBQ2pFLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDekUsQ0FBQztBQUhELHdDQUdDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsT0FBTyxDQUFDLEtBQVU7SUFDaEMsT0FBTyxDQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxTQUFTLGFBQVksUUFBUSxDQUFDLEtBQUssQ0FBQztBQUNwRCxDQUFDO0FBRkQsMEJBRUMifQ==