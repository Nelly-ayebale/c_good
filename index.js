import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/users.js';
import memeRoutes from './routes/memes.js';
import cors from 'cors';
import http from 'http';
import fs from 'fs';

//middleware
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

//Connecting to the DB
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true})
  .then(() => {
    console.log('Connected to database');
})
  .catch((err) => {
    console.error(err);
});
  
http.createServer(function (req, res) {
res.writeHead(200, { 'Content-Type': 'text/html' });
var url = req.url;
if (url === "/") {
    fs.readFile("head.html", function (err, pgres) {
        if (err)
            res.write("HEAD.HTML NOT FOUND");
        else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(pgres);
            res.end();
        }
    });
}
else if (url === "/tailPage") {
    fs.readFile("tail.html", function (err, pgres) {
        if (err)
            res.write("TAIL.HTML NOT FOUND");
        else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(pgres);
            res.end();
        }
    });
}
  
}).listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`)
});

