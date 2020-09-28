const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const app = express();
const Conversation = require("./models/Converation");
const { MONGO_USR, MONGO_PSW, MONGO_DB } = process.env;
const MONGO_URI = `mongodb+srv://${MONGO_USR}:${MONGO_PSW}@cluster0-fg0dv.gcp.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority`;

// SERVICES

const carol_bus = "http://127.0.0.1:3005";

// Mongo connection

console.log(MONGO_URI);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("open", () => {
  console.log("Mongo is connected with Isaac");
  console.log(`DB: ${MONGO_DB}`);
});

// middlewares

app.use(cors());
app.use(express.json());

// events listeners

app.post(`/events`, (req, res) => {
  console.log("received event from Carol: ", req.body);
  switch (req.body.type) {
    case "userSignUp":
      const { signUpUsername: username } = req.body.payload;
      Conversation.create({ username }, (err, createdUser) => {
        createdUser
          ? res
              .status(201)
              .json({ user_history_created: true, user: createdUser })
          : res
              .status(500)
              .json({ error: "failed creating resource", message: err });
      });
      break;
    case "messageSent":
      break;
  }
  res.status(200).json({ status: "ok" });
});

app.listen(process.env.PORT || 3002, () => {
  console.log("Isaac is listening on 3002");
});
