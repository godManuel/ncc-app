import { Server } from "socket.io";
let IO;

const initIO = (httpServer) => {
  IO = new Server(httpServer);

  IO.use((socket, next) => {
    if (socket.handshake.query) {
      let callerId = socket.handshake.query.callerId;
      socket.user = callerId;
      next();
    }
  });

  IO.on("connection", (socket) => {
    console.log(socket.user, "Connected");
    socket.join(socket.user);

    socket.on("call", (data) => {
      let calleeId = data.calleeId;
      let rtcMessage = data.rtcMessage;

      socket.to(calleeId).emit("newCall", {
        callerId: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on("endCall", (data) => {
      const { calleeId } = data;

      // Emit the endCall event to the callee
      socket.to(calleeId).emit("endCall");
    });

    socket.on("answerCall", (data) => {
      let callerId = data.callerId;
      rtcMessage = data.rtcMessage;

      socket.to(callerId).emit("callAnswered", {
        callee: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on("ICEcandidate", (data) => {
      console.log("ICEcandidate data.calleeId", data.calleeId);
      let calleeId = data.calleeId;
      let rtcMessage = data.rtcMessage;

      socket.to(calleeId).emit("ICEcandidate", {
        sender: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    //   // Audio call setup
    //   // Handle call request from the caller
    //   socket.on("call-request", (data) => {
    //     const { calleeId, offer } = data;
    //     console.log("Incoming call request from", socket.id, "to", calleeId);

    //     const connectedClients = {};

    //     // Emit the call request to the callee
    //     if (connectedClients[calleeId]) {
    //       connectedClients[calleeId].emit("call-request", socket.id);
    //       connectedClients[calleeId].calleeId = socket.id;
    //     }
    //   });

    //   // Handle call answer from the callee
    //   socket.on("answer", (data) => {
    //     const { callerId, answer } = data;
    //     console.log("Answer received from", socket.id, "to", callerId);

    //     // Emit the answer to the caller
    //     if (connectedClients[callerId]) {
    //       connectedClients[callerId].emit("answer-received", answer);
    //     }
    //   });

    //   // Handle ICE candidate exchange
    //   socket.on("ice-candidate", (data) => {
    //     const { candidate, calleeId } = data;
    //     console.log("ICE candidate received from", socket.id, "to", calleeId);

    //     // Emit the ICE candidate to the callee
    //     if (connectedClients[calleeId]) {
    //       connectedClients[calleeId].emit("ice-candidate", candidate);
    //     }
    //   });

    //   // Handle call hang up
    //   socket.on("call-ended", () => {
    //     console.log("Call ended by", socket.id);

    //     // Emit call-ended event to the other party
    //     if (connectedClients[socket.calleeId]) {
    //       connectedClients[socket.calleeId].emit("call-ended");
    //     }

    //     // Clean up connectedClients object
    //     delete connectedClients[socket.id];
    //     if (socket.calleeId) {
    //       delete connectedClients[socket.calleeId];
    //     }
    //   });

    //   // Store the connected client in the object
    //   connectedClients[socket.id] = socket;

    //   // Handle client disconnection
    //   socket.on("disconnect", () => {
    //     console.log("Client disconnected:", socket.id);

    //     // Clean up connectedClients object
    //     delete connectedClients[socket.id];
    //     if (socket.calleeId) {
    //       delete connectedClients[socket.calleeId];
    //     }
    //   });
  });
};

const getIO = () => {
  if (!IO) {
    throw Error("IO not initilized.");
  } else {
    return IO;
  }
};

export { initIO, getIO };
