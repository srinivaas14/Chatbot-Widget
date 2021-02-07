// const action_name = "action_greet_user";
const rasa_socket_url = "ws://localhost:5005";
// const sender_id = "jitesh97";
const socket = io(rasa_socket_url, {
  pathname: "/socket.io",
  transports: ["websocket"],
});

//emit user message to the server
socket.emit("user_uttered", {
  message: "hi",
  session_id: "123",
  sid: "pqr123",
});
// on connect event
socket.on("connected", function () {
  console.log(`User ${socket.id} connected.`);

  // update the session_id with sender id
  socket.emit("session_request", {
    session_id: sender_id,
  });
});

socket.on("connect_failed", function () {
  console.log(`Connection failed.`);
});

socket.on("error", function () {
  console.log(`Error occured`);
});

socket.on("disconnected", function () {
  console.log("connected to rasa");
});
// on session request confirm event
socket.on("session_confirm", function (data) {
  console.log("updated session_id: ", data);

  //emit user message to the server
  socket.emit("user_uttered", {
    message: "hi",
    session_id: data,
    sid: socket.id,
  });
});

socket.on("disconnect", function (data) {
  console.log(`User ${socket.id} disconnected.`);
});
