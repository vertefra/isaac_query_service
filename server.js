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
app.use(express.urlencoded({ extended: false }));

// events listeners

app.post(`/events`, (req, res) => {
  console.log("received event from Carol: ", req.body);
  switch (req.body.type) {
    case "userJoin":
      // check if the user exist.
      // if the user exists return the found user's username
      // if it doesnt create a new user with username equal to the username in the payload
      // and return the created user

      Conversation.findOne(
        { username: req.body.payload.username },
        (err, foundUser) => {
          if (foundUser) {
            console.log("user is found ==> ", foundUser);
            res
              .status(200)
              .json({ user_history_exists: true, user: foundUser });
          } else {
            Conversation.create(
              { username: req.body.payload },
              (err, createdUser) => {
                createdUser
                  ? res
                      .status(201)
                      .json({ user_history_created: true, user: createdUser })
                  : res
                      .status(500)
                      .json({
                        error: "failed creating resource",
                        message: err,
                      });
              }
            );
          }
        }
      ).select("username");

      break;
    case "messageSent":
      console.log("a message has been sent", req.body.payload);

      const { payload } = req.body;

      const {
        recipient_username,
        sender_username,
        timestamp,
        message,
      } = payload;

      // find recipient_username and store the message inside received_messages
      try {
        Conversation.findOneAndUpdate(
          { username: recipient_username },
          { $push: { received_messages: payload } },
          (err, updatedUser) => {
            updatedUser ? console.log(updatedUser) : console.log(err);
          }
        );

        // find sender_usernmae and store the message inside sent_messages

        Conversation.findOneAndUpdate(
          { username: sender_username },
          { $push: { sent_messages: payload } },
          (err, updatedUser) => {
            updatedUser ? console.log(updatedUser) : console.log(err);
          }
        );

        res.status(200).json({ status: "event received" });
      } catch (err) {
        res
          .status(500)
          .json({ error: "failed in updating history", message: err });
      }
      break;
    default:
      res.status(200).json({ status: "event received" });
  }
});

// query listener

app.get("/query", (req, res) => {
  const { user, friend } = req.query;
  Conversation.find({ username: user }, (err, foundMessages) => {
    if (foundMessages) {
      console.log(foundMessages[0]);
      const sent_messages_to_friend = foundMessages[0].sent_messages.filter(
        (message) => message.recipient_username === friend
      );
      const received_messages_from_friend = foundMessages[0].received_messages.filter(
        (message) => message.sender_username === friend
      );
      const messages = sent_messages_to_friend.concat(
        received_messages_from_friend
      );
      res.status(200).json({ messages });
    }
  }).select("sent_messages received_messages");
});

app.listen(process.env.PORT || 3002, () => {
  console.log("Isaac is listening on 3002");
});
