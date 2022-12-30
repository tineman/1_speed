import express from 'express';
var app = express();
import http from 'http';
var server = http.createServer(app);
import Server from 'socket.io'.Server;
const io = new Server(server);