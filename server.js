import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import indexRoutes from './routes/index.js';
import { connectDB, uploadData } from './utils/database.js';

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mongoose
connectDB();
// uploadData();

// routes
app.use('/', indexRoutes);

app.listen(process.env.PORT, () => {
    console.log(`✅ Server is running on port ${process.env.PORT}`);
});