import {initREPL, REPL_Starter, REPL_Ident } from './replproc'


function JS_REPL_STARTER (stdout_data_callback : ((_ : any) => void)) : REPL_Starter {
  return {
    replname : "node",
    arguments : [],
    initscript : null,
    stdout_data_callback : stdout_data_callback,
  };
}

// return a pair, one identifier, the other as the input channel
export function JS_initREPL (stdout_data_callback : ((_ : any) => void)) {
  let config = JS_REPL_STARTER(stdout_data_callback);
  let server = initREPL(config);
  return server
}

// let JS_REPL_STARTER = (stdout_data_callback : any) => {};