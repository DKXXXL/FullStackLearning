
// this module will 
// 1. make a standalone process, with standard in and standard out connected to ours
// 2. require the specific input function of one line
// 3. has a pool of all these process
// 4. generic for both JS interpreter and python interpreter
// 5. kill all the process when exiting
import { ChildProcess, ChildProcessWithoutNullStreams, spawn } from "child_process";

export interface REPL_Starter {
  replname : string;
  arguments : string[];
  initscript : string | null;
  stdout_data_callback : (_ : string) => void;
}

export interface REPL_Ident {
  id : number
}
// all the subprocesses, waiting for cleaning up
let children_pool : {[_ : number] : [ChildProcessWithoutNullStreams, (_ : string) => void]} = {};

let provide_id = ((i : number) => {
  var id = i;
  return () => {
    id = id + 1;
    return id
  }
})(0);

// Initialize a generic repl
export function initREPL (starter : REPL_Starter) : [REPL_Ident, (_ : string) => void] {
  let subprocess = spawn(starter.replname, starter.arguments);
  subprocess.stdout.on('data', (s) => {starter.stdout_data_callback(s.toString())});
  let newid = provide_id();
  let inputrepl = (s : string) => subprocess.stdin.write(s + '\n');
  children_pool[newid] = [subprocess, inputrepl];
  return ([{id : newid}, inputrepl]);
} 


export function killREPL (repl : REPL_Ident) : void {
  let [subprocess, _] = children_pool[repl.id];
  subprocess.kill();
}
// function inputREPL ()
