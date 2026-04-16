import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import { errorHandler} from './middleware';

import { navigation, notifications, oauth, favorites, family } from './routes';
import connectDatabase from './database/connection';



// Create express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(errorHandler);

// Routes
app.use('/notifications', notifications);
app.use('/navigation', navigation);
app.use('/oauth', oauth);
app.use('/favorites', favorites);
app.use('/family', family);






const startServer = async () => {
  console.log(`[SERVER] Starting`);
  const PORT = process.env.PORT || 4000;
  try {
    // Await database connection
    await connectDatabase();
    console.log(`[SERVER] Database Connected`);


    // Start the server after successful database connection
    const server = app.listen(PORT, () => {
      console.log(`[SERVER] Running on`, `http://localhost:${PORT}`);
    });

    /* Handle unhandled promise rejections */
    process.on('unhandledRejection', (err) => {
      if (err instanceof Error) {
        console.log(`[ERROR] Unhandled Rejection: ${err.message}`);
      }
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  } catch (error: any) {
    console.log(`[DATABASE] Connection failed: ${error.message}`);
    process.exit(1);
  }
};


startServer();