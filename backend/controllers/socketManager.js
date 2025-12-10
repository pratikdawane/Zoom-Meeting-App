
const { Server } = require("socket.io");  // to create a WebSocket server

let connections = {};
let messages = {};
let timeOnline = {};

const connectToSocket = (server) => {

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    
    io.on("connection", (socket) => {

        console.log("SOMETHING CONNECTED");

        socket.on("join-call", (path) => {
             if (connections[path] === undefined) {
                connections[path] = []
            }

            connections[path].push(socket.id);

            timeOnline[socket.id] = new Date();   // 
            
            // Includes the new user’s ID and the full list of connected users.
            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])    // Send a "user-joined" event to everyone in the room, telling them who just joined.
         
            }

            // If the room has previous messages, then send them to the newly joined user.
            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                }
            }
        })


        // Used for peer-to-peer WebRTC connection. You forward signaling data from one peer to another.
        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);

        })
        

        // Loops through connections to find which room the user belongs to. (  Find Their Room (using reduce): )
        socket.on("chat-message", (data, sender) => {   // When a user sends a message...  Triggered when someone sends a chat message.
            const [matchingRoom, found] = Object.entries(connections)
            .reduce(([room, isFound], [roomKey, roomValue]) => {
                if (!isFound && roomValue.includes(socket.id)) {
                return [roomKey, true];
                }

                return [room, isFound];

            }, ['', false]);



            if(found === true) {   // if User is found 

                if(messages[matchingRoom] === undefined) {  // If message is undefine then set [] empty in that room
                    messages[matchingRoom] = []
                }

                // Store the message , which we send in that room’s message history.
                messages[matchingRoom].push({ "sender" : sender, "data" : data, "socket-id-sender" : socket.id});
                console.log("messages", matchingRoom, ":", sender, data);  // key = matchingRoom

                // Then, send messages it to all users in that room.
                connections[matchingRoom].forEach(ele => {
                    io.to(ele).emit( "chat-message", data, sender, socket.id )
                });
            }


        })


        // When user leaves the site
        socket.on("disconnect", () => {

            //  Calculate Time Online
            var diffTime = Math.abs(timeOnline[socket.id] - new Date())

            var key

            // k = key , v = value
            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {    

                //  Find Room and Remove User , Find the room the user was in.
                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k ;

                        // Tell other users in the room that someone left.
                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        // Remove the user from the room.
                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)

                        if (connections[key].length === 0) {  
                            delete connections[key]            // If the room is now empty, delete the room entirely.
                        }

                    }
                }

            }


        })
    
    })

    return io;


}

module.exports = connectToSocket;