const path = require("path");
const fetch = require("node-fetch");
require("dotenv").config({ path: path.resolve(process.cwd(), "../.env") });

const express = require("express");
const { check, validationResult } = require("express-validator");
const app = express();
const http = require("http");
const bodyParser = require("body-parser");
const amqp = require("amqplib");

app.use(bodyParser.json());

const messageQueueConnectionString = process.env.CLOUDAMQP_URL;

app.get("/top5", async function(req, res) {
  const cacheServiceUrl =
    process.env.NODE_ENV === "production"
      ? "https://microservices-task.herokuapp.com/"
      : "http://localhost/";
  const data = await fetch(`${cacheServiceUrl}cache/top5`);
  const result = await data.json();
  res.send(result.data);
});

// Helper function to push posted data through Rabbit MQ channel to db
async function pushToDb(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let connection = await amqp.connect(messageQueueConnectionString);
  let channel = await connection.createConfirmChannel();

  // publish the data to Rabbit MQ
  let requestData = req.body;
  const from = req.path;
  console.log(
    `Published a request message from ${from}: ${JSON.stringify(requestData)}`
  );
  await publishToChannel(channel, {
    routingKey: "request",
    exchangeName: "processing",
    data: { requestData, from }
  });

  res.send(`Published to ${from.slice(1)}s: ${JSON.stringify(requestData)}`);
}

app.post(
  "/author",
  [
    check("name")
      .not()
      .isEmpty()
      .trim(),
    check("age").isInt({ min: 10, max: 120 })
  ],
  pushToDb
);

app.post(
  "/book",
  [
    check("authorId").isUUID(4),
    check("title")
      .not()
      .isEmpty()
      .trim(),
    check("pages").isInt()
  ],
  pushToDb
);

// utility function to publish messages to a channel
function publishToChannel(channel, { routingKey, exchangeName, data }) {
  return new Promise((resolve, reject) => {
    channel.publish(
      exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(data), "utf-8"),
      { persistent: true },
      function(err, ok) {
        if (err) {
          return reject(err);
        }

        resolve();
      }
    );
  });
}

async function listenForResults() {
  let connection = await amqp.connect(messageQueueConnectionString);

  // create a channel and prefetch 1 message at a time
  let channel = await connection.createChannel();
  await channel.prefetch(1);

  // start consuming messages
  await consume({ connection, channel });
}

// consume messages from RabbitMQ
function consume({ connection, channel, resultsChannel }) {
  return new Promise((resolve, reject) => {
    channel.consume("processing.results", async function(msg) {
      // parse message
      let msgBody = msg.content.toString();
      let data = JSON.parse(msgBody);
      let processingResults = data.processingResults;
      console.log("processingResults:", processingResults);

      // acknowledge message as received
      await channel.ack(msg);
    });

    connection.on("close", err => {
      return reject(err);
    });

    connection.on("error", err => {
      return reject(err);
    });
  });
}

const PORT = process.env.PORT || 5000;
server = http.createServer(app);
server.listen(PORT, "0.0.0.0", function(err) {
  if (err) {
    console.error(err);
  } else {
    console.info("Web-service listening on port %s.", PORT);
  }
});

// listen for results on RabbitMQ
listenForResults();
