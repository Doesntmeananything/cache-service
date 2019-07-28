const express = require("express");
const redis = require("redis");
const http = require("http");
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), "../.env") });
const { fetchTopAuthors, fetchAllAuthors } = require("./db");

const app = express();

const client = redis.createClient(process.env.REDIS_URL);

client.on("error", err => {
  console.log("Error " + err);
});

const topAuthors = "topAuthors";
const allAuthors = "allAuthors";

// Fetch directly from remote api once a minute
setInterval(() => {
  fetchTopAuthors()
    .then(authors => {
      // Save the API response in Redis store with an expiry date of a minute
      client.setex(topAuthors, 60, JSON.stringify(authors));
    })
    .catch(error => {
      console.log(error);
      return res.json(error.toString());
    });
  fetchAllAuthors()
    .then(authors => {
      client.setex(allAuthors, 60, JSON.stringify(authors));
    })
    .catch(error => {
      console.log(error);
      return res.json(error.toString());
    });
}, 60 * 1000);

app.get("/cache/top5", (req, res) => {
  return client.get(topAuthors, (err, authors) => {
    if (authors) {
      return res.json({ source: "cache", data: JSON.parse(authors) });
    } else {
      return res.json({ source: "cache", data: [] });
    }
  });
});

app.get("/cache/authors", (req, res) => {
  return client.get(allAuthors, (err, authors) => {
    if (authors) {
      return res.json({ source: "cache", data: JSON.parse(authors) });
    } else {
      return res.json({ source: "cache", data: [] });
    }
  });
});

const port = process.env.PORT || 3000;

server = http.createServer(app);
server.listen(port, "0.0.0.0", function(err) {
  if (err) {
    console.error(err);
  } else {
    console.info("Cache-service listening on port %s.", port);
  }
});
