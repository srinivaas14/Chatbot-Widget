const socket = io.connect("http://localhost:5005/");

socket.on("connect", function () {
  console.log("connected to rasa");
});

socket.on("disconnected", function () {
  console.log("connected to rasa");
});
