import { Server, Socket } from "socket.io"
import { Registry } from "../registry";
import { CustomSocket } from "../socket";


module.exports = (io: Server, socket: CustomSocket, man: Registry) => {

    const regiserUser = () => {
        man.clients[socket.id] = socket
    }

    const disconnectUser = (reason: string) => {

        //remove froms server registry
        man.Disconnect(socket.id, socket.username)
        console.log(`${socket.username} ${reason} from the server`)

        //send thru events namespace
        const events = io.of("/event")
        //leave all rooms
        socket.rooms.forEach(room => {
            events.to(room).emit("user-disconnected", `${socket.username} left the room`)
            socket.leave(room)
        });
    }

    //add user to server
    socket.on("connect", () => regiserUser())
    //remove user from registry
    socket.on("disconnect", (reason: string) => disconnectUser(reason))

}