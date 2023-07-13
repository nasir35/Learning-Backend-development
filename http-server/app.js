const http = require("http");
const fs = require("fs");

const routes = {
  "/": {
    GET: (__req, res) => {
      sendResponse(res, { body: { msg: "Welcome to my server!" } });
    },
  },
  "/students": {
    GET: (__req, res) => {
      const raw = fs.readFileSync("studentsInfo.json");
      const students = JSON.parse(raw);
      sendResponse(res, { body: { students } });
    },
    POST: (req, res) => {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk.toString();
      });
      req.on("end", () => {
        const payload = JSON.parse(data);
        const students = JSON.parse(fs.readFileSync("studentsInfo.json"));
        students.push(payload);
        fs.writeFileSync("studentsInfo.json", JSON.stringify(students));
        sendResponse(res, {
          body: { msg: "new Student created!", status: 201, students },
        });
      });
    },
  },
  default: (__req, res) => {
    sendResponse(res, { body: { msg: "Error! Route not Found!" } });
  },
};

const sendResponse = (
  res,
  { status = 200, contentType = "application/json", body = {} }
) => {
  res.writeHead(status, { "Content-Type": contentType });
  res.write(JSON.stringify(body));
  res.end();
};

const server = http.createServer(function (req, res) {
  const { url, method } = req;
  const currentRoute = routes[url] || routes.default;
  const handler = currentRoute[method] || routes.default;
  handler(req, res);
});
server.listen(9090, () => {
  console.log("server running on port 9090");
});
