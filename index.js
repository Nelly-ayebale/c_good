import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/users.js';
import memeRoutes from './routes/memes.js';
import cors from 'cors';

const app = express();
dotenv.config();

app.use(bodyParser.json());
app.use(cors());
app.use('/users', userRoutes);
app.use('/memes', memeRoutes);

app.get('/', (req, res) => {
    console.log('TEST...');
    res.send('Hello there, this is the HomePage!');
});

mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((err) => {
    console.error(err);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
