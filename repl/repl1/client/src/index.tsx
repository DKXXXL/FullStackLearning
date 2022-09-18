import axios from 'axios';
import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App';
import reportWebVitals from './reportWebVitals';
import { useQuery, useMutation, QueryClientProvider, QueryClient } from 'react-query';
import { send } from 'process';
// import dotenv from 'dotenv';


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

// a functional component has three subcomponents
// a textinput box, a eval button and an output screen
function ReplInput() : JSX.Element {
  let [input, setInput] = useState<string>("");
  // output will be a list of string as result
  let [output, setOutput] = useState<Array<string>>([]);
  let addOutput = (s : string) => setOutput((prev) => [s, ...prev]);

  
  let evaljs = async (s : string) => {
    return axios.post<string>(SERVER_JS+'/eval', s).then(
      ({data}) => {addOutput(data)}
    )
  };
  // set up mutation here!
  let sendreq = useMutation(evaljs);
  let clearInput = () => setInput("");
  let input_new_line = async () => {
    addOutput("> " + input);  
    sendreq.mutate(input);
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
        <button onClick={input_new_line}>Eval</button>
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
