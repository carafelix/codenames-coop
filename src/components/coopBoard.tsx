import React from "react"
import Color from "../utils/colors"
import { ElementOptionSwitch } from "./tristateSwitch/ElementOptionSwitch";
import type { switchTriStates } from "./tristateSwitch/ElementOptionSwitch";
import { getRandomSeed, generateCoopBoards } from "../logic/generate";
import noEyeImg from '../assets/no-eye.svg'
import { createWorker } from 'tesseract.js';

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
                                        row.map((color,j)=>{
                                            const strID = `${this.props.board.flat().toString()},${i},${j}`
                                            let isMarked = false
                                            if(this.props.marked?.[strID]){
                                                isMarked = true
                                            }
                                            return (
                                                <GameCardButton
                                                    key={strID}
                                                    id = {strID}
                                                    color = {color}
                                                    marked = {isMarked}
                                                    handleMarked = {this.props.curry}
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
}>{
    public state = { marked: false , style: {
        backgroundColor: this.props.color,
        opacity: '100%'
    }};

    render(){
        const style = {
            backgroundColor: this.props.color,
            opacity: this.props.marked ? '20%' : '100%'
        }
        return (
            <button 
                style = {style}
                className = "gameCard"
                onClick={() =>{this.props.handleMarked(this.props.id)}}>
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
    board : Color[][],
    teamA: Color[][],
    teamB: Color [][],
    marked: any
}>{
    constructor(props : teamProps ){
        super(props)
        const boards = generateCoopBoards(getRandomSeed())
        this.state = {
            teamSwitchButtonState: 'off',
            board: boards[0],
            teamA: boards[0],
            teamB: boards[1],
            marked: {}
        }
    }

    regenerateTeamState = () => {
        this.setState((prevState)=>{
            const boards = generateCoopBoards(getRandomSeed())
            return {
                teamSwitchButtonState: prevState.teamSwitchButtonState,
                board: prevState.teamSwitchButtonState === 'team-a' ? boards[0] : boards[1],
                teamA: boards[0],
                teamB: boards[1],
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
                <div style={{display: "flex", justifyContent: 'center', padding: '1em'}}>
                    <ElementOptionSwitch onSignalChange={this.handleToggleChange}/>
                </div>

                <button onClick={(async () => {
                    const worker = await createWorker('eng');
                    const ret = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
                    console.log(ret.data.text);
                    await worker.terminate();
                    })}>j
                </button>
                
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
    board: Color[][],
    team: 'a' | 'b',
    marked: any,
    curry: Function
}