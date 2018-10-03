const server = require('node-static');

const file = new server.Server('./');

require('http').createServer((request, response) => {
  request.addListener('end', () => {
    file.serve(request, response);
  }).resume();
}).listen(8080);
