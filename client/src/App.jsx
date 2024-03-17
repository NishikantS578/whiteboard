import {useEffect} from 'react'
import {io} from 'socket.io-client'
import pencil_icon from './assets/pencil.png'
import line_icon from './assets/diagonal-line.png'
import rectangle_icon from './assets/rectangle.png'
import eraser_icon from './assets/eraser.png'
import text_icon from './assets/text.png'

const socket = io("http://localhost:3000/")
let board
let ctx
let prev_point = {x: 0, y: 0}
let current_point = {x: 0, y: 0}
let tool = "pencil"
let mouse_down = false
let editing_text = false

function inputKey(e, should_emit=true){
    console.log(e.key)
    if(e.key.length !=1){
        return
    }
    ctx.font = "48px serif"
    ctx.fillText(e.key, current_point.x, current_point.y)
    if(should_emit == true){
        socket.emit("canvas", JSON.stringify({tool: tool, current_point: current_point, prev_point: prev_point, text: e.key}))
    }
    current_point.x += ctx.measureText(e.key).width
}

function changeTool(e){
    console.log(e.target.id)
    tool = e.target.id
    if(tool == "eraser"){
        ctx.clearRect(0, 0, board.width, board.height)
    }
    if(tool != "text"){
        editing_text = false
        document.removeEventListener("keydown", inputKey)
    }
}

function updateMouse(e){
    prev_point.x = current_point.x;
    prev_point.y = current_point.y;
    current_point.x = e.pageX - e.target.offsetLeft;
    current_point.y = e.pageY - e.target.offsetTop;
    if(tool == "pencil" && mouse_down == true){
        draw(true)
    }
}

function mouseDown(e){
    if(e.target.id == "board"){
        mouse_down = true
    }
    updateMouse(e)
}

function mouseUp(e){
    if((tool == "rectangle" || tool == "line") && mouse_down==true){
        updateMouse(e)
        draw(true)
    }
    else if(tool == "text"){
        if(editing_text == true){
            editing_text = false
            document.removeEventListener("keydown", inputKey)
        }
        else{
            editing_text = true
            document.addEventListener("keydown", inputKey)
        }
    }
    mouse_down = false
}

function draw(should_emit=false){
    if(tool == "pencil"){
        ctx.beginPath()
        ctx.lineWidth = 10
        ctx.lineCap = "round"
        ctx.moveTo(prev_point.x, prev_point.y)
        ctx.lineTo(current_point.x, current_point.y)
        ctx.stroke()
        ctx.closePath()
    }
    else if(tool == "rectangle"){
        ctx.lineWidth = 10
        ctx.lineCap = "round"
        ctx.strokeRect(prev_point.x, prev_point.y, current_point.x - prev_point.x, current_point.y - prev_point.y)
    }
    else if(tool == "line"){
        ctx.beginPath()
        ctx.lineWidth = 10
        ctx.lineCap = "round"
        ctx.moveTo(prev_point.x, prev_point.y)
        ctx.lineTo(current_point.x, current_point.y)
        ctx.stroke()
        ctx.closePath()
    }
    if(should_emit == true){
        socket.emit("canvas", JSON.stringify({tool: tool, current_point: current_point, prev_point: prev_point}))
    }
}

function initialize(){
    board = document.querySelector("#board")
    board.width = window.innerWidth;
    board.height = window.innerHeight;
    ctx = board.getContext("2d")
}

function App() {
    useEffect(initialize, [])

    socket.on("connect", ()=>{
        console.log("connected...")
    })

    socket.on("canvas", (data)=>{
        let path = JSON.parse(data)
        tool = path["tool"]
        current_point = path["current_point"]
        prev_point = path["prev_point"]
        if(tool == "text"){
            let e = {}
            e.key = path["text"]
            inputKey(e, false)
        }
        else{
            draw(false)
        }
    })

    socket.on("new", (data)=>{
        for(let a of data){
            let path = JSON.parse(a)
            tool = path["tool"]
            current_point = path["current_point"]
            prev_point = path["prev_point"]
            if(tool == "text"){
                let e = {}
                e.key = path["text"]
                inputKey(e, false)
            }
            else{
                draw(false)
            }
        }
    })

    return (
        <>
            <div className="toolbar">
                <div>
                    <img id="pencil" className="icon" src={pencil_icon} onClick={changeTool} 
                        alt="pencil icons"/>
                </div>
                <div>
                    <img id="eraser" className="icon" src={eraser_icon} onClick={changeTool}
                        alt="eraser icons">
                    </img>
                </div>
                <div>
                    <img id="line" className="icon" src={line_icon} onClick={changeTool} 
                        alt="line icons"/>
                </div>
                <div>
                    <img id="rectangle" className="icon" src={rectangle_icon} onClick={changeTool}
                        alt="rectangle icons">
                    </img>
                </div>
                <div>
                    <img id="text" className="icon" src={text_icon} onClick={changeTool}
                        alt="text icons">
                    </img>
                </div>
            </div>
            <canvas id="board" 
                onMouseMove={(e)=>{if(tool=="pencil")updateMouse(e)}}
                onMouseUp={mouseUp} 
                onMouseLeave={()=>{if(tool == "pencil") mouseUp()}}
                onMouseDown={mouseDown}>
            </canvas>
        </>
    )
}

export default App
