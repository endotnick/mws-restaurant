const server = require('node-static');
const http = require('http');

const file = new server.Server('./');

http.createServer((request, response) => {
  request.addListener('end', () => {
    file.serve(request, response);
  }).resume();
}).listen(process.env.PORT || 8080);
