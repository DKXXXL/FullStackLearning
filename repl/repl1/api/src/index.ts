import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

// dotenv is about getting environment information from ".env"

dotenv.config();
const cors = require("cors");

const app: Express = express();
const port = process.env.PORT || 8000;


// create Router here
const router = require('./jsroute');


app.use(cors());
app.use("/JS", router);


app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});