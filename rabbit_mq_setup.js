require("dotenv").config();

const amqp = require("amqplib");

const messageQueueConnectionString = process.env.CLOUDAMQP_URL;

async function setup() {
  console.log("Setting up RabbitMQ Exchanges/Queues...");
  let connection = await amqp.connect(messageQueueConnectionString);

  let channel = await connection.createChannel();

  await channel.assertExchange("processing", "direct", { durable: true });

  await channel.assertQueue("processing.requests", { durable: true });
  await channel.assertQueue("processing.results", { durable: true });

  await channel.bindQueue("processing.requests", "processing", "request");
  await channel.bindQueue("processing.results", "processing", "result");

  console.log("Setup DONE");
  process.exit();
}

setup();
