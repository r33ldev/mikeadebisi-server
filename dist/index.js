"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const config_1 = __importDefault(require("config"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const apollo_server_core_1 = require("apollo-server-core");
const logger_1 = __importDefault(require("./utils/logger"));
const mongo_1 = require("./utils/mongo");
const contact_resolver_1 = require("./contact/resolver/contact.resolver");
dotenv_1.default.config();
const main = async () => {
    const DB = config_1.default
        .get('dbUri')
        .replace('<PASSWORD>', process.env.DB_PASSWORD);
    const PORT = config_1.default.get('port');
    const schema = await (0, type_graphql_1.buildSchema)({
        resolvers: [contact_resolver_1.ContactResolver],
        emitSchemaFile: true,
        validate: false,
    });
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.set('trust proxy', 1);
    const server = new apollo_server_express_1.ApolloServer({
        schema,
        context: (ctx) => ctx,
        plugins: [
            process.env.NODE_ENV === 'production'
                ? (0, apollo_server_core_1.ApolloServerPluginLandingPageProductionDefault)()
                : (0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)(),
        ],
    });
    await server.start();
    server.applyMiddleware({ app });
    app.get('/', (_, res) => {
        res.status(200).send('Hello there!, hope we meet soon!');
    });
    app.listen(PORT, () => {
        logger_1.default.info(`Server started on port http://localhost:${PORT}`);
    });
    (0, mongo_1.connectToMongoDb)(DB);
};
main().catch((err) => {
    console.error('error starting server', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map