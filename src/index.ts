import { Context } from './types/context';
import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import {
  ApolloServerPluginLandingPageProductionDefault,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from 'apollo-server-core';
import log from './utils/logger';
import { connectToMongoDb } from './utils/mongo';
import { ContactResolver } from './contact/resolver/contact.resolver';

dotenv.config();
const main = async () => {
  const string = process.env.MONGO_CONNECTION_STRING as string;
  const DB = string.replace('<PASSWORD>', process.env.DB_PASSWORD as string);
  const PORT = process.env.PORT

  const schema = await buildSchema({
    resolvers: [ContactResolver],
    emitSchemaFile: true,
    validate: false,
  });

  const app = express();

  app.use(express.json());
  app.use(cookieParser()); 
  app.set('trust proxy', 1);

  const server = new ApolloServer({
    schema,
    context: (ctx: Context) => ctx,
    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageProductionDefault()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });

  await server.start();
  server.applyMiddleware({ app });

  app.get('/', (_: any, res) => {
    res.status(200).send('Hello there!, hope we meet soon!');
  });

  app.listen(PORT, () => {
    log.info(`Server started on port http://localhost:${PORT}`);
  });

  connectToMongoDb(DB);
};

main().catch((err) => {
  console.error('error starting server', err);
  process.exit(1);
});
