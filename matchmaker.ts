import { Namespace, Socket } from "socket.io";
import { CustomSocket } from "./socket";
import { v4 as uuidv4 } from "uuid";






//MatchMaker makes matches
export class MatchMaker {

    public queue: Queue = new Queue()
    private running: Boolean = false
    private runInterval: any


    JoinQueue(s: CustomSocket) {

        if (this.queue.Exists(s.serverID)) return

        this.queue.Queue(s)

    }

    Stop() {
        clearInterval(this.runInterval)
    }


    Match() {

        console.log("Attempting to match \n")
        if (this.queue.Size() < 2) {
            console.log("Not enough people \n")
        }

        const strangerOne = this.queue.Dequeue()
        const strangerTwo = this.queue.Dequeue()

        if (!strangerOne || !strangerTwo) return


        const roomID = uuidv4()
        strangerOne.join(roomID)
        strangerTwo.join(roomID)

        strangerOne.emit("match-found", { roomID, username: strangerTwo.username })
        strangerTwo.emit("match-found", { roomID, username: strangerOne.username })

        console.log("%s matched with %s", strangerOne.username, strangerTwo.username)

    }

    Start() {

        console.log("Starting matchmaker")
        this.runInterval = setInterval(() => {

            if (this.queue.Size() >= 2) this.Match()

        }, 100)

    }

}

class Queue {

    private users: CustomSocket[] = []
    private records: Set<string> = new Set()



    Exists(serverID: string): Boolean {

        if (this.records.has(serverID)) return true
        return false

    }

    Queue(s: CustomSocket) {

        if (this.records.has(s.serverID)) return

        this.users.unshift(s)
        this.records.add(s.serverID)
    }
    Dequeue(): CustomSocket | undefined {

        if (this.Size() === 0) return undefined;

        const user = this.users.pop()

        if (!user) return
        this.records.delete(user.serverID)

        return user
    }

    Size() {
        return this.users.length
    }


}