const server = require('node-static');
const http = require('http');

const file = new server.Server('./');
const port = process.env.PORT || 5000;

http.createServer((request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/plain',
  });
  response.write('hello heroku!', 'utf-8');
  response.end();
  /*
  request.addListener('end', () => {
    file.serve(request, response);
  }).resume();
  */
}).listen(port, () => {
  console.log(`app up on port: ${port}`);
});
