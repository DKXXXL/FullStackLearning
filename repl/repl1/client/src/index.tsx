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
  let addOutput = (s : string) => setOutput((prev) => [s, ...prev]);

  // register the connection status with socket
  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));  
    socket.on('stdout', (s : string) => {
      addOutput(s);
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
    evaljs(input);
    // return res
    clearInput()
  };
  // this key is important for the React framework for some reason -- we just make sure every 
  // one in the list has a unique `key`
  let outputScreen = <ul>{output.map((s, index) => <div key={"el" + index.toString()}>{s}</div>)}</ul> ;
  return (
    <div>
      <div>
        <input id="evalBox"
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
      {outputScreen}
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
