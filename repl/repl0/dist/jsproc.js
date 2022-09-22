"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JS_killREPL = exports.JS_initREPL = void 0;
const replproc_1 = require("./replproc");
function JS_REPL_STARTER(stdout_data_callback) {
    return {
        replname: "node",
        arguments: [],
        initscript: null,
        stdout_data_callback: stdout_data_callback,
    };
}
// return a pair, one identifier, the other as the input channel
function JS_initREPL(stdout_data_callback) {
    let config = JS_REPL_STARTER(stdout_data_callback);
    let server = (0, replproc_1.initREPL)(config);
    return server;
}
exports.JS_initREPL = JS_initREPL;
exports.JS_killREPL = replproc_1.killREPL;
// let JS_REPL_STARTER = (stdout_data_callback : any) => {};
