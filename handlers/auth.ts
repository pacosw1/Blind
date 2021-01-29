import { Namespace, Server, Socket } from "socket.io"
import { Registry } from "../registry";
import { CustomSocket } from "../socket";


module.exports = (io: Server, socket: CustomSocket, man: Registry) => {



    const auth: Namespace = io.of("/auth")

    const authMiddleWare = (sock: Socket, next: any) => {

        if (man.clients[sock.id]) {
            next()
            return
        }
        next(new Error("unauthorized access"))

    }


    const setUsername = (username: string, callback: any) => {

        //if username taken
        if (man.usernameList.has(username)) {
            return callback({
                status: 0,
                message: "Username taken"
            })
        }

        //send success response
        callback({
            status: 1,
            username: username,
            message: "Username assigned"
        })
    }


    //declarations
    socket.on("auth", (username, callback) => setUsername(username, callback))
    io.use((s, next) => authMiddleWare(s, next))


}