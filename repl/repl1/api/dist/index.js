"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
// dotenv is about getting environment information from ".env"
dotenv_1.default.config();
const cors = require("cors");
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
// create Router here
const router = require('./jsroute');
// Req.body will contain key-value pairs of data submitted in the request body. 
//  By default, it is undefined, and is populated when you use body-parsing middleware such as body-parser and multer.
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(cors());
app.use("/JS", router);
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
});
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
// we create a socket here
