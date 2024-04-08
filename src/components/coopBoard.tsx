import React from 'react';
import { ElementOptionSwitch } from './tristateSwitch/ElementOptionSwitch';
import { getRandomSeed, generateFlatCoopBoards } from '../logic/generate';
import { createWorker } from 'tesseract.js';
import { Board } from './board';
import noEyeImg from '../assets/no-eye.svg';
import cameraImg from '../assets/camera.svg';
import { cardData, teamProps, switchTriStates } from '../app';
const searchParams = new URLSearchParams(window.location.search);

export class CoopGameUI extends React.Component<
  {},
  {
    teamSwitchButtonState: switchTriStates;
    board: cardData[];
    teamA: cardData[];
    teamB: cardData[];
    rotated: [number, number];
    marked: any; //:LLLLLLLLLLL
  }
> {
  constructor(props: teamProps) {
    super(props);

    if (!searchParams.get('seed')) {
      searchParams.set('seed', getRandomSeed());
    }
    window.history.pushState({}, '', '?' + searchParams.toString());

    let wordsArray = (JSON.parse(searchParams.get('words') || `[]`))
    
    if(wordsArray.length !== 25 ||
       Object.getPrototypeOf(wordsArray) !== Object.getPrototypeOf([]) ||
       wordsArray.every((i:any)=>typeof i !== 'string')
    ){
        wordsArray = new Array(25).fill('')
    }
    const boards = generateFlatCoopBoards(
      searchParams.get('seed') || getRandomSeed()
    ).map((b) =>
      b.map((c,i) => {
        return {
          color: c,
          word: wordsArray[i],
        };
      })
    );

    this.state = {
      teamSwitchButtonState: 'off',
      board: boards[0],
      teamA: boards[0],
      teamB: boards[1],
      rotated: [0, 0],
      marked: {},
    };
  }

  handleWordsChange = () =>{
    this.setState(()=>{
        
    })
  }

  regenerateTeamState = () => {
    this.setState((prevState) => {
      searchParams.set('seed', getRandomSeed());
      window.history.pushState({}, '', '?' + searchParams.toString());
      const words = JSON.parse(searchParams.get('words') || `${new Array(25).fill('')}`)

      const boards = generateFlatCoopBoards(
        searchParams.get('seed') || getRandomSeed()
      ).map((b) =>
        b.map((c, i) => {
          return {
            color: c,
            word: words[i],
          };
        })
      );

      return {
        teamSwitchButtonState: prevState.teamSwitchButtonState,
        board:
          prevState.teamSwitchButtonState === 'team-a' ? boards[0] : boards[1],
        teamA: boards[0],
        teamB: boards[1],
        marked: {},
      };
    });
  };

  handleToggleChange = (childState: switchTriStates) => {
    this.setState((prev) => {
      return {
        teamSwitchButtonState: childState,
        board: childState === 'team-a' ? this.state.teamA : this.state.teamB,
        teamA: prev.teamA,
        teamB: prev.teamB,
        marked: prev.marked,
      };
    });
  };

  handleMarkedChanges = (id: string) => {
    const incoming = {
      [id]: id,
    };
    const mergedMarked = { ...this.state.marked, ...incoming };
    this.setState((prev) => {
      if (prev.marked?.[id] && mergedMarked?.[id]) {
        mergedMarked[id] = false;
      }

      return {
        teamSwitchButtonState: prev.teamSwitchButtonState,
        board: prev.board,
        teamA: prev.teamA,
        teamB: prev.teamB,
        marked: mergedMarked,
      };
    });
  };

    splitAndSendToOCR = (file: File) => {
    const reader = new cameraReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
  
        canvas.width = img.width / 5;
        canvas.height = img.height / 5;
  
        const worker = await createWorker();
  
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 5; col++) {
            // Draw the grid square onto the canvas
            ctx.drawImage(
              img,
              col * canvas.width,
              row * canvas.height,
              canvas.width,
              canvas.height,
              0,
              0,
              canvas.width,
              canvas.height
            );
            // Get image data of the grid square
            const imageData = canvas.toDataURL('image/jpeg');
            // Perform OCR on the grid square using Tesseract.js
            const {
              data: { text },
            } = await worker.recognize(imageData);
            const word = text;
            reader.storage.push(word.replace(/[^a-zA-Z]/g, '').toLowerCase());
          }
        }
        await worker.terminate();

        searchParams.set('words', JSON.stringify(reader.storage))
        this.setState((prev)=>{
          return {
            board: prev.board.map((v,i)=>{
                return {
                    color: v.color,
                    word: reader.storage[i]
                }
            }),
            teamA: prev.teamA.map((v,i)=>{
                return {
                    color: v.color,
                    word: reader.storage[i]
                }
            }),
            teamB: prev.teamB.map((v,i)=>{
                return {
                    color: v.color,
                    word: reader.storage[i]
                }
            }),
            rotated: prev.rotated,
            marked: prev.marked,
          }
        })
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
    return reader
  }
  

  render() {
    return (
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '1em',
            alignItems: 'center',
            gap: '1em',
          }}
        >
          <ElementOptionSwitch onSignalChange={this.handleToggleChange} />

          <label
            id="cameraLabel"
            htmlFor="img_uploader"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <img src={cameraImg} alt="camera" />
          </label>
          <input
            type="file"
            id="img_uploader"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={async () => {
              const input = document.querySelector(
                '#img_uploader'
              ) as HTMLInputElement;
              if (input.files?.[0]) {
                await this.splitAndSendToOCR(input.files[0]);
              }
            }}
          ></input>
        </div>

        {this.state.teamSwitchButtonState !== 'off' ? (
          <Board
            board={this.state.board}
            team={this.state.board === this.state.teamA ? 'a' : 'b'}
            key={this.state.board.flat().toString()} // must be a string flat boardA,boardB : boardB,boardA
            marked={this.state.marked}
            curry={this.handleMarkedChanges}
          />
        ) : (
          <div style={{ display: 'flex' }}>
            <img src={noEyeImg} alt="blind eye" className="eye" />
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '0.5em',
            gap: '0.5em',
          }}
        >
          <button onClick={() => window.history.back()}>previous</button>
          <button onClick={this.regenerateTeamState}>regenerate</button>
          <button onClick={() => window.history.forward()}>next</button>
        </div>
      </div>
    );
  }
}
class cameraReader extends FileReader{
    public storage : string[] 
    constructor(){
        super()
        this.storage = []
    }
}