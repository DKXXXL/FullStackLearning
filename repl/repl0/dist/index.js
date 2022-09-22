"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
console.log("what");
// var spawn = require('child_process').spawn,
let child = (0, child_process_1.spawn)('node', ['-i']);
// child.stdin.setEncoding('utf-8');
child.stdout.on('data', (s) => { console.log(s.toString()); });
// child.stderr.pipe(process.stdout);
child.stdin.write("1 + 1\n");
child.stdin.write("console.log(1)\n");
child.stdin.write("HH\n");
child.stdin.end();
console.log("what?");
// setTimeout(() => {JS_killREPL(replid)}, 2000);
