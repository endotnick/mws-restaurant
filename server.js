const server = require('node-static');
const http = require('http');

const file = new server.Server('./');
const port = process.env.PORT || 5000;

http.createServer((request, response) => {
  request.addListener('end', () => {
    file.serve(request, response);
  }).resume();
}).listen(port, () => {
  console.log(`app up on port: ${port}`);
});
