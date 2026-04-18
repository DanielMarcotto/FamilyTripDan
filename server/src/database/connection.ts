import mongoose from 'mongoose';

const connectDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }

    const conn = await mongoose.connect(uri);

    mongoose.connection.on(
      'error',
      console.error.bind(console, 'connection error:')
    );

    mongoose.connection.once('open', () =>
      console.log(`MongoDB Connected: ${conn.connection.host}`)
    );
  } catch (error) {
    console.error('[DATABASE] Connection failed:', error);
    process.exit(1);
  }
};

export default connectDatabase;