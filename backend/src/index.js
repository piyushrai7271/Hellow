import "./config/env.js";
import app from "./app.js";
import connectDb from "./config/database.connection.js";
const port = process.env.PORT || 5100;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log("Server is running on port :", port);
    });
  })
  .catch((err) => {
    console.log(`Server connection error : ${err}`);
  });
