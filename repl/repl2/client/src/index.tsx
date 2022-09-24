import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App';
import reportWebVitals from './reportWebVitals';
import Terminal from "./terminal";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);




root.render(
  <React.StrictMode>
    <Terminal toServer={async (s) => { await new Promise ((r) => setTimeout(r, 1000)) ;return "Nothing";}} fromServer={(_) => {}} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
