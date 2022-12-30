import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);



app.use(express.static(`public`));

io.on("connection", (socket) => {
    console.log(`User with socket id ${socket.id} just connected!`);
});

httpServer.listen(3000, () => {
    console.log('listening on *:3000');
});
