import mongoose from 'mongoose'

const connectDatabase = async () => {

  const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}${process.env.MONGODB_URI}`;

  /* const uri = !process.env.DOCKER_MONGODB_URI
  ? `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URI}`
  : process.env.DOCKER_MONGODB_URI;  // Default to local MongoDB connection */
  
  const conn = await mongoose.connect(uri);
  mongoose.connection.on(
    "error",
    console.error.bind(console, "connection error:")
  );
  mongoose.connection.once("open", () =>
    console.log(
      `MongoDB Connected: ${conn.connection.host}`
    )
  );
  
  //console.log(`[DATABASE]   Connected - ${conn.connection.host}`);
};



export default connectDatabase