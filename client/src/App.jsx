import {useEffect} from 'react'
import {io} from 'socket.io-client'

let prevPoint = {x: 0, y: 0}
let currentPoint = {x: 0, y: 0}
let tool = "pencil"
const socket = io("http://localhost:3000/")

function changeTool(e){
    console.log(e.target.id)
    tool = e.target.id
}

function update_mouse(e){
    if(tool == "pencil"){
        prevPoint.x = currentPoint.x;
        prevPoint.y = currentPoint.y;
        currentPoint.x = e.pageX - e.target.offsetLeft;
        currentPoint.y = e.pageY - e.target.offsetTop;
    }
}

function mouse_down(e){
    if(tool == "rectangle" || tool == "line"){
        prevPoint.x = e.pageX - e.target.offsetLeft
        prevPoint.y = e.pageY - e.target.offsetTop
    }
    else{
        document.querySelector("#board").addEventListener("mousemove", draw)
    }
}

function mouse_up(e){
    if(tool == "rectangle" || tool == "line"){
        currentPoint.x = e.pageX - e.target.offsetLeft
        currentPoint.y = e.pageY - e.target.offsetTop
        draw(e)
    }
    else{
        document.querySelector("#board").removeEventListener("mousemove", draw)
    }
}

function draw(e){
    const board = document.querySelector("#board")
    const ctx = board.getContext("2d")
    if(ctx){
        if(tool == "pencil"){
            ctx.beginPath()
            ctx.lineWidth = 10
            ctx.lineJoin = "round"
            ctx.lineCap = "round"
            ctx.moveTo(prevPoint.x, prevPoint.y)
            ctx.lineTo(currentPoint.x, currentPoint.y)
            ctx.stroke()
            socket.emit("canvas", JSON.stringify({tool: tool, current_point: currentPoint, prev_point: prevPoint}))
        }
        else if(tool == "rectangle"){
            ctx.lineWidth = 10
            ctx.lineCap = "round"
            ctx.strokeRect(prevPoint.x, prevPoint.y, currentPoint.x - prevPoint.x, currentPoint.y - prevPoint.y)
        }
        else if(tool == "line"){
            ctx.lineWidth = 10
            ctx.lineCap = "round"
            ctx.moveTo(prevPoint.x, prevPoint.y)
            ctx.lineTo(currentPoint.x, currentPoint.y)
            ctx.stroke()
        }
        socket.emit("canvas", JSON.stringify({tool: tool, current_point: currentPoint, prev_point: prevPoint}))
    }
}

function initialize(){
    const board = document.querySelector("#board")
    board.width = window.innerWidth;
    board.height = window.innerHeight;
}

function App() {
    useEffect(initialize, [])
    socket.on("connect", ()=>{
        console.log("connected...")
    })
    socket.on("canvas", (data)=>{
        const board = document.querySelector("#board")
        const ctx = board.getContext("2d")
        const path = JSON.parse(data)
        if(path["tool"] == "pencil" || path["tool"] == "line"){
            ctx.lineWidth = 10
            ctx.lineCap = "round"
            ctx.moveTo(path["prev_point"]["x"], path["prev_point"]["y"])
            ctx.lineTo(path["current_point"]["x"], path["current_point"]["y"])
            ctx.stroke()
        }
        else if(path["tool"] == "rectangle"){
            ctx.lineWidth = 10
            ctx.lineCap = "round"
            ctx.strokeRect(path["prev_point"]["x"], path["prev_point"]["y"], path["current_point"]["x"] - path["prev_point"]["x"], path["current_point"]["y"] - path["prev_point"]["y"])
        }
    })
    socket.on("new", (data)=>{
        const board = document.querySelector("#board")
        const ctx = board.getContext("2d")
        for(let a of data){
            let path = JSON.parse(a)
            if(path["tool"] == "pencil" || path["tool"] == "line"){
                ctx.lineWidth = 10
                ctx.lineCap = "round"
                ctx.moveTo(path["prev_point"]["x"], path["prev_point"]["y"])
                ctx.lineTo(path["current_point"]["x"], path["current_point"]["y"])
                ctx.stroke()
            }
            else if(path["tool"] == "rectangle"){
                ctx.lineWidth = 10
                ctx.lineCap = "round"
                ctx.strokeRect(path["prev_point"]["x"], path["prev_point"]["y"], path["current_point"]["x"] - path["prev_point"]["x"], path["current_point"]["y"] - path["prev_point"]["y"])
            }
        }
    })
    return (
        <>
            <div className="toolbar">
                <div id="pencil" onClick={changeTool}>pencil</div>
                <div id="line" onClick={changeTool}>line</div>
                <div id="rectangle" onClick={changeTool}>rectangle</div>
            </div>
            <canvas id="board" onMouseMove={update_mouse} onMouseUp={mouse_up} onMouseLeave={()=>{if(tool == "pencil") mouse_up()}} onMouseDown={mouse_down}></canvas>
        </>
    )
}

export default App
