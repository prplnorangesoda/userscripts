const http = require("http");

const port = 8030;


let server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("server");
})

server.listen(port, () => {
  console.log("listening")
})