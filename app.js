const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// Initializing io server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // http://localhost:3000
  },
});

// Extra variable
const PORT = process.env.PORT || 5050;

app.get("/", (req, res) => {
  res.send("Hello Socket 👋👋");
});

let users = {};

// const addUser = (userId, socketId) => {
//   !users.some((user) => user.userId === userId) &&
//     users.push({ userId, socketId });
// };

// const removeUser = (socketId) => {
//   users = users.filter((user) => user.socketId !== socketId);
// };

// const getUser = (userId) => {
//   return users.find((user) => user.userId === userId);
// };

const addUser = (userId, socketId) => {
  users[userId] = { userId, socketId };
};

const removeUser = (socketId) => {
  const user = Object.values(users).find((a) => a.socketId === socketId);
  if (user) {
    delete users[user.userId];
  }
};

const getUser = (userId) => {
  const user = users[userId];
  if (user) {
    return user;
  }
  return {};
};

io.on("connection", (socket) => {
  console.log("Connection successfull");
  console.log(users);

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

server.listen(PORT, () => {
  console.log(`Hello From socket on ${PORT}`);
});
