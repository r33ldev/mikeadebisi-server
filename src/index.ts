import { Context } from './types/context';
import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import morgan from 'morgan';
import log from './utils/logger';
import { connectToMongoDb } from './utils/mongo';
import { ContactResolver } from './contact/resolver/contact.resolver';
import cors from 'cors';

dotenv.config();
const main = async () => {
  const string = process.env.MONGO_CONNECTION_STRING as string;
  const DB = string.replace('<PASSWORD>', process.env.DB_PASSWORD as string);
  const PORT = process.env.PORT;

  const schema = await buildSchema({
    resolvers: [ContactResolver],
    emitSchemaFile: true,
    validate: false,
  });

  const whitelist = [
    process.env.CLIENT_URL,
    process.env.ORIGIN_SERVER,
    process.env.RDC_CLIENT_URL,
    'http://localhost:3000',
  ];

  const corsOptions = {
    origin(
      origin: string | undefined,
      callback: (arg0: Error | null, arg1: boolean | undefined) => void
    ) {
      if (
        origin === undefined ||
        whitelist.indexOf(origin) !== -1 ||
        /^https:\/\/(.*\.)?zwilt.com$/.test(origin) ||
        (process.env.NODE_ENV !== 'production' &&
          /^https?:\/\/localhost:\d{4}$/.test(origin))
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
  };

  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  // protecting our api from unauthorized origins
  app.use(cors(corsOptions));

  app.use(morgan('combined'));

  // initializing session and httpOnly cookies
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  const server = new ApolloServer({
    schema,
    context: (ctx: Context) => ctx,
    cache: 'bounded',
    // plugins: [
    //   process.env.NODE_ENV === 'production'
    //     ? ApolloServerPluginLandingPageProductionDefault()
    //     : ApolloServerPluginLandingPageGraphQLPlayground(),
    // ],
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
