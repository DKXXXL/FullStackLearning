"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
// dotenv is about getting environment information from ".env"
dotenv_1.default.config();
const cors = require("cors");
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
// create Router here
const router = require('./jsroute');
app.use(cors());
app.use("/JS", router);
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
});
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
