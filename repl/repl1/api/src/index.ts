import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyparser from 'body-parser';
import { Server } from 'socket.io';
import http from 'http';

// dotenv is about getting environment information from ".env"

dotenv.config();
const cors = require("cors");

const app: Express = express();
const port = process.env.PORT || 8000;


// create Router here
const router = require('./jsroute');

// Req.body will contain key-value pairs of data submitted in the request body. 
//  By default, it is undefined, and is populated when you use body-parsing middleware such as body-parser and multer.
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true })) 


app.use(cors());
app.use("/JS", router);


app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

// we create a socket here
// const server_app = express();
const socket_port = 9000;
// server_app.use(cors());
const socket_server = http.createServer();
const io = new Server(socket_server, {
  cors:{
    // we need to specify the CORS here
    origin: "http://192.168.0.127:3000"
  }
}); 

io.on('connection', (socket) => {
  console.log('a user connected');
});

socket_server.listen(socket_port, () => {
  console.log(`socket port listening on *:${socket_port}`);
})