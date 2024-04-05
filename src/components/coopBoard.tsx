import React from "react"
import Color from "../utils/colors"
import { ElementOptionSwitch } from "./tristateSwitch/ElementOptionSwitch";
import type { switchTriStates } from "./tristateSwitch/ElementOptionSwitch";
import { getRandomSeed, generateCoopBoards } from "../logic/generate";
import noEyeImg from '../assets/no-eye.svg'

export function Board(props : {
    board: Color[][],
    team: 'a' | 'b'
    marked: cardCoordinate[]
}) {
        return (
            <div className={`board ${props.team}`}>
                {
                    props.board.map((row,i)=>{
                            return (
                                <div key={`${props.board.flat().toString()},${i}`} className="boardRow">
                                    {
                                        row.map((color,j)=>{
                                            return (
                                                <GameCardButton
                                                    key={`${props.board.flat().toString()},${i},${j}`}
                                                    coordinate = { {
                                                        team: props.team,
                                                        i,
                                                        j
                                                    } }
                                                    color= {color}
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

export class GameCardButton extends React.Component<{
    color: Color,
    coordinate: cardCoordinate
}>{
    public state = { marked: false };

    render(){
        return (
            <button 
                style = {{ backgroundColor: this.props.color, opacity: (this.state.marked) ? '20%' : '100%'}}
                className = "gameCard"
                onClick={() =>{
                    this.state.marked = !this.state.marked
                    this.forceUpdate() // impure
                }}>
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
    teamB: Color [][]
}>{
    constructor(props : teamProps ){
        super(props)
        const boards = generateCoopBoards(getRandomSeed())
        this.state = {
            teamSwitchButtonState: 'off',
            board: boards[0],
            teamA: boards[0],
            teamB: boards[1]
        }
    }

    regenerateTeamState = () => {
        this.setState((state)=>{
            const boards = generateCoopBoards(getRandomSeed())
            return {
                teamSwitchButtonState: state.teamSwitchButtonState,
                board: state.teamSwitchButtonState === 'team-a' ? boards[0] : boards[1],
                teamA: boards[0],
                teamB: boards[1]
            }
        })
    }

    handleToggleChange = (childState : switchTriStates) => {
        this.setState(() => {
            return {
                teamSwitchButtonState: childState,
                board: childState === 'team-a' ? this.state.teamA : this.state.teamB
            }
        })
      };

    render(){
        return (
            <div>
                <div style={{display: "flex", justifyContent: 'center', padding: '1em'}}>
                    <ElementOptionSwitch onSignalChange={this.handleToggleChange}/>
                </div>
                
                {
                    this.state.teamSwitchButtonState !== 'off'  ? 
                    ( 
                    <Board board = {this.state.board}
                    team = {this.state.board === this.state.teamA ? 'a' : 'b'}
                    marked={[{
                        team: 'a',
                        i: 0,
                        j: 0
                    }]} /> 
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

interface cardCoordinate {
    team : string,
    i: number,
    j: number
}