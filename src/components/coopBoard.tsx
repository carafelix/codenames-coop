import React from 'react';
import { ElementOptionSwitch } from './tristateSwitch/ElementOptionSwitch';
import { getRandomSeed, generateFlatCoopBoards } from '../logic/generate';
import { createWorker } from 'tesseract.js';
import { Board } from './board';
import noEyeImg from '../assets/no-eye.svg';
import cameraImg from '../assets/camera.svg';
import { teamProps, switchTriStates } from '../app';
import { RotateButton } from './rotateButton';
import Color from '../utils/colors';
import { ShareDialog } from './popups/shareDialog';
export class CoopGameUI extends React.Component<
  {},
  {
    teamSwitchButtonState: switchTriStates;
    board: Color[];
    teamA: Color[];
    teamB: Color[];
    words: string[];
    seed: string;
    rotated: [number, number];
    showShareDialog: boolean;
    marked: any; //:LLLLLLLLLLL
  }
> {
  constructor(props: teamProps) {
    super(props);
    const searchParams = new URLSearchParams(window.location.search);

    const seed = searchParams.get('seed') || getRandomSeed();
    let wordsArray = JSON.parse(searchParams.get('words') || `[]`);

    if (!checkWordsArrayIsValid(wordsArray)) {
      wordsArray = [];
    }

    const boards = generateFlatCoopBoards(seed);

    this.state = {
      teamSwitchButtonState: 'off',
      board: boards[0],
      teamA: boards[0],
      teamB: boards[1],
      words: wordsArray,
      rotated: [0, 0],
      marked: {},
      showShareDialog: false,
      seed: seed,
    };
  }
  // rework to not use url params on regeneration, only while entering the link first time or with a join button
  regenerateTeamState = () => {
    this.setState((prevState) => {
      const seed = getRandomSeed();
      const boards = generateFlatCoopBoards(seed);
      return {
        board:
          prevState.teamSwitchButtonState === 'team-a' ? boards[0] : boards[1],
        teamA: boards[0],
        teamB: boards[1],
        marked: {},
        seed: seed,
      };
    });
  };

  handleHistoryNavigation = () => {};

  handleToggleChange = (childState: switchTriStates) => {
    this.setState(() => {
      return {
        teamSwitchButtonState: childState,
        board: childState === 'team-a' ? this.state.teamA : this.state.teamB,
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
        marked: mergedMarked,
      };
    });
  };

  handleShareDialog = () => {
    this.setState((prev)=>{
      return {
        showShareDialog: !prev.showShareDialog
      }
    })
  }

  cleanWords = () => {
    this.setState(() => {
      return {
        words: [],
      };
    });
  };
  // TOO MUCH COUPLING

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

        this.setState(() => {
          return {
            words: reader.storage,
          };
        });
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
    return reader;
  };

  render() {
    return (
      <div className='coop'>
        {this.state.showShareDialog && (
          <ShareDialog
            params={generateSearchParams(this.state.seed, this.state.words)}
            handleClose = {this.handleShareDialog}
          />
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '1em',
            alignItems: 'center',
            gap: '1em',
          }}
        >
          <RotateButton angle={0} rotateCurrentBoardHandler={() => {}} />

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
            key={this.state.board.flat().toString()} // must be a string flat boardA,boardB : boardB,boardA
            board={this.state.board}
            team={this.state.board === this.state.teamA ? 'a' : 'b'}
            words={this.state.words}
            marked={this.state.marked}
            handleMarked={this.handleMarkedChanges}
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
          <button onClick={this.cleanWords}>clean</button>
          <button onClick={this.regenerateTeamState}>regenerate</button>
          <button onClick={this.handleShareDialog}>share</button>
        </div>
      </div>
    );
  }
}
class cameraReader extends FileReader {
  public storage: string[];
  constructor() {
    super();
    this.storage = [];
  }
}

function generateSearchParams(seed: string, words: string[]) {
  const p = new URLSearchParams();
  p.set('seed', seed);
  if (checkWordsArrayIsValid(words)) {
    p.set('words', JSON.stringify(words));
  }
  return p;
}

function checkWordsArrayIsValid(words: string[]) {
  return !(
    words.length !== 25 ||
    Object.getPrototypeOf(words) !== Object.getPrototypeOf([]) ||
    words.every((i: any) => typeof i !== 'string')
  );
}
