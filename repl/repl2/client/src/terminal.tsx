import './terminal.css'
import React, {useEffect, useState} from 'react';

// Terminal is always a bidreictional tool
interface TerminalProperty {
  toServer : (_ : string) => Promise<string>;
  // toServer is where Terminal will connect to and synchnously get a report back
  fromServer : ((_ : ((_ : string) => void)) => void);
  // fromServer is a callback requesting a call back, that will make the report : string
  //  into the display 
  input_prefix? : string;
  // the prefix in front of each input
  starting_decoration? : string[];
  // Terminal Starting Info
}
export default function Terminal(prop : TerminalProperty) {
  let input_prefix = prop.input_prefix === undefined ? " > " : prop.input_prefix;
  
  let [displayHistory, setDisplayHistory] = useState<Array<string>>([]);
  let [inputContent, setInputContent] = useState<string>("");
  let [idlestate, setIdle] = useState<boolean>(true);
  let history_content = 
    displayHistory.map((a, _) => {return (<div className='terminal-div'> {a} </div>)});
    // displayHistory.reduce((a, b, _) => a + '\n' + b, "");
  let addHistory = (s : string) => setDisplayHistory((prev) => [...prev, s]);
  let addLastOutput = (s : string) => setDisplayHistory((prev) => {
    let n = [...prev];
    n[n.length - 1] = n[n.length - 1] + s;
    return n
  });
  
  let input_new_line = () => {
    addHistory(input_prefix + inputContent);
    setIdle(false);
    prop.toServer(inputContent).then((s) => {addHistory(s); setIdle(true);});
    // evaljs(input);
    // return res
    setInputContent("");
  };


  useEffect(() => {
    prop.fromServer(addLastOutput);
  }
  ,[]);

  useEffect( () => {
    document.getElementById("maininput")?.focus();
  }
  );

  

  // let historydisplay = <div className="terminal-div"> {history_content} </div>;
  let inputdisplay   = 
    <div id="block_container">    
      <div id="prefix">{input_prefix}</div>  
      <div contentEditable 
      tabIndex={0}
      id="maininput"
      onInput={(evt) => {
        if (evt.currentTarget.textContent != null) 
        {setInputContent(evt.currentTarget.textContent)} 
        else {setInputContent("")} }}
        onKeyDown={(evt) => 
          {
            if (evt.key === "Enter") 
            {input_new_line();
              evt.currentTarget.textContent="";}
          }}
        onKeyUp={(evt) => 
          {
            if (evt.key === "Enter") 
            {
              evt.currentTarget.textContent="";}
          }}>  
      </div>
  </div>
  let loading = <div> Loading ... </div>;

  // let inputdisplay = <textarea onInput={(evt) => {evt}}></textarea>
  let with_or_out_input = [...history_content, (idlestate? inputdisplay : loading)];
  // return <ul className='nospace'> {with_or_out_input}  </ul>
  return <div> {with_or_out_input} </div>
}
