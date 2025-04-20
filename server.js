console.log("🔍 server.js started");
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { map } from "zod";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  const onlineUsers = new Map();
  console.log("📡 Current onlineUsers map:", [...onlineUsers.entries()]);

  io.on("connection", (socket) => {
    //add user to map when they loggen in or refresh

    socket.on("add-user", (userId) => {
      onlineUsers.set(userId, socket.id);

      socket.on("get-online-users", () => {
        const onlineUsersIds = Array.from(onlineUsers.keys());
        socket.emit("online-users", onlineUsersIds);
      });

      console.log(`👤 User ${userId} connected with socket ${socket.id}`);
    });

    // private message handler
    socket.on("send-message", (message) => {
      const { senderId, receiverId, content, senderMessage } = message;
      console.log(`📨 Message from ${senderId} to ${receiverId}: "${content}"`);
      const receiverSocket = onlineUsers.get(message.receiverId);
      console.log("reciever ID", onlineUsers.get(message.receiverId));

      if (receiverSocket) {
        io.to(receiverSocket).emit("receive-message", {
          senderId,
          receiverId,
          content,
          senderMessage,
        });
      }
    });
    // remove user from map on disconneting

    socket.on("disconnect", () => {
      for (const [userId, sIds] of onlineUsers.entries()) {
        if (sIds === socket.id) {
          onlineUsers.delete(userId);
          console.log(`🔴 User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
