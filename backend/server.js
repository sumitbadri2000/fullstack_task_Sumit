const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const Redis = require("ioredis");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());

const REDIS_KEY = "FULLSTACK_TASK_SUMIT";

const redis = new Redis({
  host: "redis-12675.c212.ap-south-1-1.ec2.cloud.redislabs.com",
  port: 12675,
  username: "default",
  password: "dssYpBnYQrl01GbCGVhVq2e4dYvUrKJB",
});

const mongoURL = "mongodb+srv://sumit:sumitb@cluster0.15y5v.mongodb.net/";
const client = new MongoClient(mongoURL);
let mongoCollection;

async function initMongo() {
  await client.connect();
  const db = client.db("assignment");
  mongoCollection = db.collection("assignment_sumit");
}
initMongo();

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("add", async (task) => {
    const tasks = JSON.parse(await redis.get(REDIS_KEY)) || [];
    tasks.push(task);

    if (tasks.length > 50) {
      await mongoCollection.insertMany(tasks.map((t) => ({ task: t })));
      await redis.del(REDIS_KEY);
      console.log("Flushed to MongoDB after 50 tasks");
    } else {
      await redis.set(REDIS_KEY, JSON.stringify(tasks));
    }
  });
});

app.get("/fetchAllTasks", async (req, res) => {
  const tasks = JSON.parse(await redis.get(REDIS_KEY)) || [];
  res.json(tasks);
});

server.listen(3000, () => {
  console.log("✅ Backend running on http://localhost:3000");
});
