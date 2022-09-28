const net = require('node:net');
const repl = require('node:repl');
const stream = require('stream');
let connections = 0;

reading = new stream.PassThrough();
writing = new stream.PassThrough();

q = []

writing.on("data", (s) => q.push(s.toString()));

repl.start({
  prompt : "",
  input : reading,
  output : writing
});

reading.write("1\n")
