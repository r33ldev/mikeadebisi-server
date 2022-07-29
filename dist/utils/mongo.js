"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToMongoDb = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("./logger"));
const connectToMongoDb = async (dbUri) => {
    try {
        await mongoose_1.default.connect(dbUri);
        logger_1.default.info('Connected to MongoDB');
    }
    catch (err) {
        logger_1.default.error('error connecting to mongo');
        console.error(err);
    }
};
exports.connectToMongoDb = connectToMongoDb;
//# sourceMappingURL=mongo.js.map