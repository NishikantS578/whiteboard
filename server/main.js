const { Server } = require("socket.io")

const io = new Server({
    cors:{
        origin: "http://localhost:5173"
    }
})

let stack = {}

io.on("connection", (socket) => {
    for(i of socket.rooms){
        stack[i] = []
    }
    socket.on("join", (data)=>{
        for(i of socket.rooms){
            socket.leave(i)
        }
        socket.join(data)
        for(i of socket.rooms){
            stack[i] = []
        }
    })
    socket.on("canvas", (data)=>{
        for(i of socket.rooms){
            socket.to(i).emit("canvas", data)
            stack[i].push(data)
        }
    })
    socket.on("disconnect", (reason)=>{
        for(i in stack){
            if(!(io.sockets.adapter.rooms.has(i))){
                delete stack[i]
            }
        }
        console.log(stack)
    })
})


io.listen(3000)
