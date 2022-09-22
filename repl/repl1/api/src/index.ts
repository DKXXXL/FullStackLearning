import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyparser from 'body-parser';
import { Server } from 'socket.io';
import http from 'http';
import { JS_initREPL, JS_killREPL } from './jsproc';

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


// we use socket -- this is a more natural way to do
//    because the message is bidirectional -- especially when
//    multi-threaded stuff is running, like in shell things are always bidirectional
//  it is possible to make things easier by using HTML post but pipeline stuff seems better implemented by 
//    socket

// The following is an example creating a socket io server
//    note that we need to specify CORS


// we create a socket here
// const server_app = express();
const socket_port = 9000;
// server_app.use(cors());
// https://socket.io/docs/v3/handling-cors/
//   check out here to handle cors
const socket_server = http.createServer();
const io = new Server(socket_server, {
  cors:{
    // we need to specify the CORS here
    origin: "http://192.168.0.127:3000"
  }
}); 

// for each user there is a corresponding unique socket.id
// we map each socket.id to 

// var user_REPL_map : {[ _ : string] : number} = {};

// function get_REPL_handler (id : string) : 

io.on('connection', (socket) => {
  console.log(`user ${socket.id} connected`);
  // we need to create a new process from jsproc
  // return the proc handler
  let stdout = (s : string) => {socket.emit("stdout", s);};
  let [replid, replinput] = JS_initREPL(stdout);

  socket.on('stdin', (s) => {replinput(s);});
  // register deallocation: see https://socket.io/get-started/chat
  socket.on('disconnect', () =>{
    console.log(`user ${socket.id} disconnected`);
    JS_killREPL(replid);
  }
  );
});



socket_server.listen(socket_port, () => {
  console.log(`socket port listening on *:${socket_port}`);
})