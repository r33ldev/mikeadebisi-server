import mongoose from 'mongoose';
import log from './logger';

export const connectToMongoDb = async (dbUri: string) => {
  try {
    await mongoose.connect(dbUri);
    log.info('Connected to MongoDB');
  } catch (err) {
    log.error('error connecting to mongo');
    console.error(err);
  }
};
