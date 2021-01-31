
import { createServer } from "http";
import { Namespace, Server, Socket } from "socket.io";
import { Registry } from "./registry"
import { CustomSocket } from "./socket";
import { v4 as uuidv4 } from "uuid";
import { MatchMaker } from "./matchmaker";
import { callbackify } from "util";


// rest of the code remains same
const PORT = 8000;

const app = require('express')();

const server = require('http').createServer(app);


const options = {
  cors: {
    origin: '*'
  }
};
const io = require('socket.io')(server, options);


const registry = new Registry(io)



const authHandlers = require("./handlers/auth");


//main
const onConnection = (socket: CustomSocket) => {
  // authHandlers(io, socket, registry);
}



// io.on("connection", onConnection);

const chat: Namespace = io.of("/chat")
const auth: Namespace = io.of("/auth")

const matchMaker = new MatchMaker()






matchMaker.Start()


auth.on("connection", (socket: CustomSocket) => {


  socket.on("connected", () => {
    console.log("socket:%s connected \n", socket.id)
  })



  // socket.on("stop-matchmaking", (callback) => {

  //   if (!matchMaker.queue.Exists(socket.serverID)) {

  //     callback({
  //       status: 0,
  //       message: "you werent in the matchmaking queue"
  //     })
  //   }



  // })

  socket.on("typing", (data) => {

    let { roomID, typing } = data

    socket.to(roomID).broadcast.emit("typing", {
      username: socket.username,
      typing,
      timestamp: +new Date()
    })

  })



  socket.on("message-status", (data) => {
    let { messageID, status, roomID } = data
    socket.to(roomID).broadcast.emit("message-status", { ...data, username: socket.username })
  })


  socket.on("chat", (data, callback) => {

    let { roomID, message } = data


    const randomID = uuidv4()
    const uuid = `${socket.username}:${roomID}:${randomID}`

    const timestamp = +new Date()

    callback({
      status: 1,
      messageID: uuid,
      message: "message sent",
      timestamp
    })


    socket.to(roomID).broadcast.emit("chat", {
      username: socket.username,
      message,
      timestamp,
      messageID: uuid,
    })

  })

  //start matchmaking
  socket.on("matchmaking", (callback: any) => {

    matchMaker.JoinQueue(socket)

    console.log("%s Looking for a match", socket.username)

    callback({
      status: 1,
      message: "Looking for match"
    })

  })





  socket.on("authenticate", (username: string, callback: any) => {

    //if username taken
    if (registry.usernameList.has(username)) {
      return callback({
        status: 0,
        message: "Username taken"
      })
    }

    socket.cookie = uuidv4()
    socket.serverID = uuidv4()
    socket.username = username

    //add socket to server
    registry.AddUser(socket)

    //send success response
    callback({
      status: 1,
      username: username,
      authCookie: socket.cookie,
      message: "Username assigned"
    })

    console.log(`${socket.username} has connected to the server`)

  })

  socket.on("reconnect", (cookie: string, callback: any) => {

    const found: Boolean = registry.CheckCookie(cookie)

    if (!found) {

      callback({
        status: 0,
        message: "Session Expired, Authenticate again"
      })
      return

    }


    const { serverID, username } = registry.clients[cookie]

    //restore user metadata
    socket.username = username
    socket.serverID = serverID


    callback({
      status: 1,
      username: registry.clients[cookie].username,
      message: "Session restored"
    })

    console.log(`${socket.username} has reconnected`)

  })



  socket.on("disconnect", (reason: string) => {
    if (socket.serverID) console.log(`${socket.username} has disconnected`)
  })
})


const typing: Namespace = io.of("/typing")
const events: Namespace = io.of("/events")



//listen on port
server.listen(PORT);





