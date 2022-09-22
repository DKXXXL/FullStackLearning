"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.killREPL = exports.initREPL = void 0;
// this module will 
// 1. make a standalone process, with standard in and standard out connected to ours
// 2. require the specific input function of one line
// 3. has a pool of all these process
// 4. generic for both JS interpreter and python interpreter
// 5. kill all the process when exiting
const child_process_1 = require("child_process");
// all the subprocesses, waiting for cleaning up
let children_pool = {};
let provide_id = ((i) => {
    var id = i;
    return () => {
        id = id + 1;
        return id;
    };
})(0);
// Initialize a generic repl
function initREPL(starter) {
    let subprocess = (0, child_process_1.spawn)(starter.replname, starter.arguments);
    subprocess.stdout.on('data', starter.stdout_data_callback);
    let newid = provide_id();
    let inputrepl = (s) => subprocess.stdin.write(s + '\n');
    children_pool[newid] = [subprocess, inputrepl];
    return ([{ id: newid }, inputrepl]);
}
exports.initREPL = initREPL;
function killREPL(repl) {
    let [subprocess, _] = children_pool[repl.id];
    subprocess.kill();
}
exports.killREPL = killREPL;
// function inputREPL ()
