import "./config/env.js";
import app from "./app.js";
import { createServer } from "node:http";
import connectDb from "./config/database.connection.js";
import initSocket from "./Socket/index.js";

// env variables.......
const port = process.env.PORT || 5100;

connectDb()
  .then(() => {
    const server = createServer(app);

    // initialize socket
    initSocket(server);

    server.listen(port, () => {
      console.log("Server is running on port :", port);
    });
  })
  .catch((err) => {
    console.log(`Server connection error : ${err}`);
  });
