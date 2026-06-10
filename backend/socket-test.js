const { io } = require("socket.io-client");

const socket = io("http://127.0.0.1:5052");

socket.on("connect",()=>{
  console.log("Socket Bağlandı",socket.id);
})

socket.on("taskStatusUpdated",(data)=>{
  console.log("Yeni Event Geldi");
  console.log(data);
})

socket.on("disconnect",()=>{
  console.log("Socket Bağlantısı koptu");
})
