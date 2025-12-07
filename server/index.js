const { Server } = require("socket.io");
const io = new Server(8000, {
  cors: true,
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("joinRoom", (data) => {
    const { email, roomNumber } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);

    io.to(roomNumber).emit("userJoined", { email, id: socket.id });
    socket.join(roomNumber);

    io.to(socket.id).emit("joinRoom", data);
  });

  socket.on("callUser", ({ to, offer }) => {
    io.to(to).emit("incomingCall", { from: socket.id, offer });
  });

  socket.on("answerCall", ({ to, answer }) => {
    io.to(to).emit("callAccepted", { from: socket.id, answer });
  });

  socket.on("negotiationNeeded", ({ to, offer }) => {
    io.to(to).emit("incomingNegotiation", { from: socket.id, offer });
  });

  socket.on("peerNegotiationDone", ({ to, answer }) => {
    io.to(to).emit("peerNegotiationFinal", { from: socket.id, answer });
  });
});
