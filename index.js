const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
const corsOpts = {
  origin: ["http://localhost:3000"],
  credentials: true,
};
app.use(cors(corsOpts));
// app.options("*", cors(corsOpts));

mongoose.connect(process.env.MONGO_DB, () => {
  console.log(`mongo connected`);
});

app.use("/auth", require("./routes/userRouter"));
app.use("/customer", require("./routes/customerRouter"));

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
