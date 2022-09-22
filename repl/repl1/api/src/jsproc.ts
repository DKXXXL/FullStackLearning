import { kill } from 'process';
import {initREPL, REPL_Starter, REPL_Ident, killREPL } from './replproc'


function JS_REPL_STARTER (stdout_data_callback : ((_ : string) => void)) : REPL_Starter {
  return {
    replname : "node",
    arguments : [],
    initscript : null,
    stdout_data_callback : stdout_data_callback,
  };
}

// return a pair, one identifier, the other as the input channel
export function JS_initREPL (stdout_data_callback : ((_ : string) => void)) {
  let config = JS_REPL_STARTER(stdout_data_callback);
  let server = initREPL(config);
  return server
}


export let JS_killREPL = killREPL;
// let JS_REPL_STARTER = (stdout_data_callback : any) => {};