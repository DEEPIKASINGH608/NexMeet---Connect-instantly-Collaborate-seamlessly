// import { Server } from "socket.io";


// let connections = {}
// let messages = {}
// let timeOnline = {}

// export const connectToSocket = (server) => {
//     const io = new Server(server);

//     io.on("connection", (socket) =>{

//         socket.on("join-call", (path) => {

//             if(connection[path] == undefined) {
//                 connection[path] = []
//             }
//             connections[path].push(socket.id)

//             timeOnline[socket.id] = new Date();

//             for(let a = 0; a < connections[path].length; i++) {
//                 io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
//             }

//             if(message[path] != undefined) {
//                 for(let a =0; a< message[path].length; ++a) {
//                     io.to(socket.id).email("chat-message", messages[path][a]['data'],
//                         messages[path][a]['sender'], messages[path][a]['socket-id-sender'])

//                 }
//             }

//         })

//         socket.on("signal", (toId, message)=>{
//             io.to(toId).emit("signal", socket.id, message);
//         })

//         socket.on("chat-message", (data, sender) => {

//             const[matchingRoome, found] = Object.entries(connections)
//             .reduce(([room, isFound], [roomKey, roomValue]) =>{

//                 if(!isFound && roomValue.includes(socket.id)) {
//                     return [roomKey, true];
//                 }

//                 return [room, isFound];
//             }, ['', false]);

//         if(found == true){
//             if(messages[matchinRoom] == undefined) {
//                 messages[mathingRoom] = []
//             }

//             messages[matchingRoom].push({'sender': sender, "data": data, "socket-id-sender": socket.id
//                 console.log("message", Key, ":", sender, data)

//                 connections[matchingRoom].forEach((elem) => {
//                     io.to(elem).emit("chat-message", data, sender, socket.id)
//                 })
//             }


//         })

//         socket.on("disconnect", () => {

//             var diffTime = Math.abs(timeOnline[socket.id] - new Date())
//             var key

//             for(const [k, v] of JSON.parse( JSON.stringyfy(Object.entries(connections)))) {

//                 for(let a = 0; a < v.legth; ++a) {
//                     if(v[a] == socket.id) {
//                         key = k

//                         for (let a =0; a<connections[key].legth; ++a) {
//                             io.to(connections[key][a]).emit('user-left', socket.id)
//                         }

//                         var index = connections[key].indexOf(socket.id)


//                         connections[key].splice(index, 1)

//                         if (connections[key].legth == 0) {
//                             delete connections[key]
//                         }
//                     }
//                 }
//             }

//         })
//     })
//     return io;

// };



import { Server } from "socket.io";

let connections = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => {
    // Recommendation: If you get browser connection blocks, change to:
    const io = new Server(server,
        { cors: {
             origin: "*",
             methods: ["GET", "POST"],
             }
    });


    io.on("connection", (socket) => {

        socket.on("join-call", (path) => {

            // 1. Fixed: Changed "connection" to "connections"
            if (connections[path] == undefined) {
                connections[path] = []
            }
            connections[path].push(socket.id)

            timeOnline[socket.id] = new Date();

            // 2. Fixed: Changed loop increment from "i++" to "a++"
            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
            }

            // 3. Fixed: Changed "message" to "messages" and ".email" to ".emit"
            if (messages[path] != undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                }
            }

        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", (data, sender) => {

            // 4. Fixed: Corrected spelling typo "matchingRoome" to "matchingRoom"
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {

                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];
                }, ['', false]);

            if (found == true) {
                // 5. Fixed: Corrected spellings "matchinRoom" and "mathingRoom" to "matchingRoom"
                if (messages[matchingRoom] == undefined) {
                    messages[matchingRoom] = []
                }

                // 6. Fixed: Closed the parenthesis, closed the curly brace object array push, and fixed undefined "Key" reference
                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id });
                console.log("message", matchingRoom, ":", sender, data);

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }

        }) // 7. Fixed: Added missing closing parenthesis for socket.on("chat-message")

        socket.on("disconnect", () => {

            var diffTime = Math.abs(timeOnline[socket.id] - new Date())
            var key

            // 8. Fixed: Removed the broken JSON parsing overhead. Iterating directly over Object.entries() works perfectly.
            for (const [k, v] of Object.entries(connections)) {

                // 9. Fixed: Corrected all spelling typos of ".legth" to ".length"
                for (let a = 0; a < v.length; ++a) {
                    if (v[a] == socket.id) {
                        key = k

                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)

                        if (connections[key].length == 0) {
                            delete connections[key]
                        }
                    }
                }
            }

        })
    })
    return io;
};



