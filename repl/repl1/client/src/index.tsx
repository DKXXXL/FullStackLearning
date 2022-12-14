import axios from 'axios';
import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// import App from './App';
import reportWebVitals from './reportWebVitals';
import { useQuery, useMutation, QueryClientProvider, QueryClient } from 'react-query';
import { send } from 'process';
// import dotenv from 'dotenv';
import {io} from 'socket.io-client';
import { JsxElement } from 'typescript';
// import shl from 'highlight';
// import 'highlight';
import Prism from "prismjs";
// import AceEditor from "react-ace";
// import "ace-builds/src-noconflict/mode-javascript";
// import "ace-builds/src-noconflict/theme-github";
// import "ace-builds/src-noconflict/ext-language_tools";

// const shl = require("prismjs");

type HighlightingInput = {text : string, language:string}
// function Highlighting(prop : HighlightingInput) : JSX.Element {
//   let language = prop.language;
//   let text = prop.text;
//   if (language === undefined) {
//     language = null;
//   }
//   return React.createElement(
//     'pre', language,
//     [React.createElement('code', null, [text])]
//   )
// }

function Highlighting(prop : HighlightingInput) : JSX.Element {
  let language = prop.language;
  let text = prop.text;
  let formatted = Prism.highlight(text, Prism.languages.javascript, 'javascript');
  return <div dangerouslySetInnerHTML={{__html: formatted}}></div>
}

// dotenv.config();
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const AXIOSSUCCESS = 200; 

// Use this react server to evaluate at the local
// bad! e.g. not able to remember the lexical info
// and vulnerable
// function evalJS (s : string) : string {
//   try {
//     let k = eval(s);
//     return k.toString()
//   } catch(err) {
//     return (err as Error).message;
//   }
// }
// const SERVERPORT = process.env.SERVERPORT;
const SERVERPORT = 8000;
const SERVER : string = `http://192.168.0.127:${SERVERPORT}`
const SERVER_JS = SERVER + "/JS"

const SOCKET_SERVER : string = `http://192.168.0.127:9000`


const socket = io(SOCKET_SERVER);

// a functional component has three subcomponents
// a textinput box, a eval button and an output screen
function ReplInput() : JSX.Element {
  let [isConnected, setIsConnected] = useState(socket.connected);
  let [input, setInput] = useState<string>("");
  // output will be a list of string as result
  let [output, setOutput] = useState<Array<string>>([]);
  let addOutput = (s : string) => setOutput((prev) => [...prev, s]);
  let addToLastLine = (s : string) => setOutput(
    (prev) => {
      let newcontents = [...prev];
      let len = newcontents.length;
      newcontents[len-1] = newcontents[len-1] + s;
      return newcontents 
    });

  // register the connection status with socket
  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));  
    socket.on('stdout', (s : string) => {
      if (s.endsWith("\n")) {
        addOutput(s);
      }
      else {
        addOutput(s + "\n")
      }
    });
    return () => {
      // if this .off is removed, then it will repeat on stdout
      socket.off('stdout');
      socket.off('connect');
      socket.off('disconnect');
    }
  }, []
  )


  
  // let evaljs = async (s : string) => {
  //   return axios.post(SERVER_JS+'/eval', {exp : s}).then(
  //     (data) => {addOutput(data.data.result)}
  //   )
  // };
  let evaljs = (s : string) => {
    return socket.emit("stdin", s);
  };


  // Onetime initialization

  // set up mutation here!
  // let sendreq = useMutation(evaljs);
  let clearInput = () => setInput("");
  let input_new_line = () => {
    // addOutput("> " + input);  
    if (!isConnected) {return}
    addToLastLine(input);
    evaljs(input);
    // return res
    clearInput()
  };
  // this key is important for the React framework for some reason -- we just make sure every 
  // one in the list has a unique `key`
  let outputScreen = <ul>{output.map((s, index) => 
    <div key={"el" + index.toString()} 
    // dangerouslySetInnerHTML={{__html : (shl.highlight(s))}}
    >  
    <Highlighting text={s} language="javascript"/>
    {/* {s} */}
    </div>)}
  </ul> ;
  return (
    <div>
      {outputScreen}
      <div id="evalBox">
        <input id="evalInput"
              type="text" 
              value={input}
              // onChange will detect the change of the textbox, 
              //    and make sure `input` is the single source of truth of current `input`
              onChange={(evt) => setInput(evt.target.value)}
              onKeyUp={(evt) => {if (evt.key === "Enter") {input_new_line()}} }
              />
        <button onClick={input_new_line}
                disabled={!isConnected}>Eval</button>
      </div>
  </div>
  )
}

root.render(

  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <ReplInput />
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
