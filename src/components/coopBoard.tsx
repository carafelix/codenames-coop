import React from "react"
import Color from "../utils/colors"
import { chunk } from 'lodash' 
import { ElementOptionSwitch } from "./tristateSwitch/ElementOptionSwitch";
import type { switchTriStates } from "./tristateSwitch/ElementOptionSwitch";
import { getRandomSeed, generateFlatCoopBoards } from "../logic/generate";
import { createWorker } from 'tesseract.js';
import noEyeImg from '../assets/no-eye.svg'
import cameraImg from '../assets/camera.svg'


export class Board extends React.Component<boardProps,{
    marked : any
}>{
    constructor(
        props : boardProps
    ){
        super(props)
        this.state = {
            marked: {}
        }
    }

    render(){
        return (
            <div className={`board ${this.props.team}`}>
                {
                    this.props.board.map((row,i)=>{
                            return (
                                <div key={`${this.props.board.flat().toString()},${i}`} className="boardRow">
                                    {
                                        row.map((element,j)=>{
                                            const strID = `${this.props.board.flat().toString()},${i},${j}`
                                            let isMarked = false
                                            if(this.props.marked?.[strID]){
                                                isMarked = true
                                            }
                                            return (
                                                <GameCardButton
                                                    key={strID}
                                                    id = {strID}
                                                    color = {element.color}
                                                    marked = {isMarked}
                                                    handleMarked = {this.props.curry}
                                                    word = {element.word}
                                                />
                                            )
                                        })
                                    }
                                </div>
                            )
                        }
                    )
                }
            </div>
        )
    }
}

export class GameCardButton extends React.Component<{
    color: Color,
    marked: boolean
    id : string
    handleMarked: Function
    word : string | null
}>{
    render(){
        return (
            <button 
                style = {{
                    backgroundColor: this.props.color,
                    opacity: this.props.marked ? '20%' : '100%',
                    color: this.props.color === "#000" ? '#ffffffee' : '#242424',
                    textAlign: 'center'
                }}
                className = "gameCard"
                onClick={() => {this.props.handleMarked(this.props.id)}}>
                {this.props.word || ' '}
            </button>
        )
    }
}
interface teamProps {
    teamA: Color[][],
    teamB: Color[][]
}
export class CoopGameUI extends React.Component<{},{
    teamSwitchButtonState : switchTriStates,
    board : cardData[][],
    teamA: cardData[][],
    teamB: cardData[][],
    words: string[],
    marked: any
}>{
    constructor(props : teamProps ){
        super(props)
        const boards = generateFlatCoopBoards(getRandomSeed()).map(b=>chunk(b.map(c=>{
            return {
                color: c,
                word: null
            }
        }),5))

        this.state = {
            teamSwitchButtonState: 'off',
            board: boards[0],
            teamA: boards[0],
            teamB: boards[1],
            words: [],
            marked: {}
        }
    }

    regenerateTeamState = () => {
        this.setState((prevState)=>{
            const boards = generateFlatCoopBoards(getRandomSeed()).map((b)=>chunk(b.map((c,i)=>{
                return {
                    color: c,
                    word: prevState.words[i]
                }
            }),5))
            return {
                teamSwitchButtonState: prevState.teamSwitchButtonState,
                board: prevState.teamSwitchButtonState === 'team-a' ? boards[0] : boards[1],
                teamA: boards[0],
                teamB: boards[1],
                words: [],
                marked: {}
            }
        })
    }

    handleToggleChange = (childState : switchTriStates) => {
        this.setState((prev) => {
            return {
                teamSwitchButtonState: childState,
                board: childState === 'team-a' ? this.state.teamA : this.state.teamB,
                teamA: prev.teamA,
                teamB: prev.teamB,
                marked: prev.marked
            }
        })
    };

    handleMarkedChanges = (id : string) => {
        const incoming = {
            [id]: id
        }
        const mergedMarked = {...this.state.marked, ...incoming}
        this.setState((prev)=>{
            if(prev.marked?.[id] && mergedMarked?.[id]){
                mergedMarked[id] = false
            }
            
            return {
                teamSwitchButtonState: prev.teamSwitchButtonState,
                board: prev.board,
                teamA: prev.teamA,
                teamB: prev.teamB,
                marked: mergedMarked
            }
        })
    }

    render(){
        return (
            <div>
                <div style={{display: "flex", justifyContent: 'center', padding: '1em', alignItems: 'center', gap: '1em'}}>
                    <ElementOptionSwitch onSignalChange={this.handleToggleChange}/>

                    <label id="cameraLabel" htmlFor="img_uploader" style={{ display: "flex", alignItems: 'center'}}>
                        <img src={cameraImg} alt="camera"/>
                    </label>
                    <canvas></canvas>
                    <input type="file" 
                        id="img_uploader"
                        accept="image/*"
                        style={{display: "none"}}
                        onChange={(
                            async () => {
                            const worker = await createWorker('spa');
                            const input = document.querySelector('#img_uploader') as HTMLInputElement
                            if(input.files?.[0]){
                                const words = await splitAndSendToOCR(input.files[0])
                                this.setState(()=>{
                                    return {
                                        words
                                    }
                                })
                            }
                        })}
                        >
                    </input>
                </div>
                
                {
                    this.state.teamSwitchButtonState !== 'off'  ? 
                    ( 
                    <Board board = {this.state.board}
                    team = {this.state.board === this.state.teamA ? 'a' : 'b'}
                    key={this.state.board.flat().toString()} // must be a string flat boardA,boardB : boardB,boardA
                    marked = {this.state.marked}
                    curry = {this.handleMarkedChanges}
                    /> 
                    )        :
                    <div style={{display: 'flex'}}>
                        <img src={noEyeImg} 
                         alt="no view para los papis"
                         className="eye"/> 
                    </div>
                }

                <div style={{display: "flex", justifyContent: 'center', padding: '0.5em', gap: "0.5em"}}>
                    <button>previous</button>
                    <button onClick={this.regenerateTeamState}>regenerate</button>
                    <button>next</button>
                </div>
            </div>
        )   
    }
}

interface boardProps {
    board: cardData[][],
    team: 'a' | 'b',
    marked: any,
    curry: Function
}

interface cardData{
    color: Color,
    word: string | null
}

async function splitAndSendToOCR(file : File) {
    const ocrResults : string[] = [];

    const reader = new FileReader();
    reader.onload = async function (e) {
        const img = new Image();
        img.onload = async function () {
            // const canvas = document.createElement('canvas');
            const canvas = document.querySelector('canvas')
            if(!canvas) return;
            const ctx = canvas.getContext('2d');
            if(!ctx) return;
            // Calculate grid square dimensions
            const squareWidth = img.width / 5;
            const squareHeight = img.height / 5;

            // Create an array to store the OCR results

            // Loop through each grid square
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    // Set canvas size to the grid square dimensions
                    canvas.width = squareWidth;
                    canvas.height = squareHeight;

                    // Draw the grid square onto the canvas
                    ctx.drawImage(img, col * squareWidth, row * squareHeight, squareWidth, squareHeight, 0, 0, squareWidth, squareHeight);

                    // Get image data of the grid square
                    const imageData = canvas.toDataURL('image/jpeg');
                    const worker = await createWorker()
                    // Perform OCR on the grid square using Tesseract.js    
                    const { data: { text } } = await worker.recognize(imageData);
                    const word = text
                    // Store the OCR result
                    ocrResults.push(word.replace(/[^a-zA-Z]/g, '').toLowerCase());
                }
            }
            // Output OCR results
            // console.log(ocrResults);
        };
        img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
    return ocrResults

}