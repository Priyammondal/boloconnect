const { Server } = require("socket.io");
const io = new Server(8000, {
    cors: true
});

io.on("connection", socket => {
    console.log("New client connected:", socket.id);
    socket.on("joinRoom", data => {
        console.log(data);
    })
})