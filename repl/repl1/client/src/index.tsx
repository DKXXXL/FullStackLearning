import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

function evalJS (s : string) : string {
  try {
    let k = eval(s);
    return k.toString()
  } catch(err) {
    
    return (err as Error).message;
  }
}

function ReplInput() : JSX.Element {
  let [input, setInput] = useState("");
  let [output, setOutput] = useState<Array<String>>([]);
  let addOutput = (s : string) => setOutput((prev) => [s, ...prev]);
  let outputs = <ul>{output.map((s) => <div>{s}</div>)}</ul> ;
  return (
    <div>
      <div>
        <input id="evalBox"
              type="text" 
              value={input}
              onChange={(evt) => setInput(evt.target.value)}/>
        <button onClick={() => {addOutput("> " + input); addOutput(evalJS(input))}}>Eval</button>
      </div>
    
      {outputs}
    
  </div>
  )
}

root.render(
  <React.StrictMode>
    <ReplInput />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
