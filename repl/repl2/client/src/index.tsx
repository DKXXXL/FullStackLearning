import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App';
import reportWebVitals from './reportWebVitals';
import Terminal from "./terminal";
import repl from 'repl';
// import "stream-browserify"
import stream from 'stream';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
// const stream = require("stream");
// const k = new stream.Readable();
// For some reason I cannot make the following run, repl and stream are not there
const input = new stream.PassThrough();
const output = new stream.PassThrough();

const server = repl.start({prompt : "", input : input, output : output})

root.render(
  <React.StrictMode>
    <Terminal toServer={async (s) => { input.write(s); return ""}} fromServer={(f) => {output.on("data", (s) => {f(s)})}} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
