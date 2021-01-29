import { Namespace, Server, Socket } from "socket.io"
import { Registry } from "../registry";
import { CustomSocket } from "../socket";


module.exports = (io: Server, socket: CustomSocket, man: Registry) => {



    const chat: Namespace = io.of("/chat")



    chat.on("c", (s) => {








    })





    // //declarations
    // socket.on("auth", (username, callback) => setUsername(username, callback))
    // io.use((s, next) => authMiddleWare(s, next))


}



