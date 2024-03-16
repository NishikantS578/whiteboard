const { Server } = require("socket.io")

const io = new Server({
    cors:{
        origin: "http://localhost:5173"
    }
})

let stack = []

io.on("connection", (socket) => {
    socket.emit("new", stack)
    socket.on("canvas", (data)=>{
        socket.broadcast.emit("canvas", data)
        stack.push(data)
    })
})


io.listen(3000)
