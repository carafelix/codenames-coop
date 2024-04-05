import _lodash from 'lodash';
import Color from '../utils/colors.ts';
import seedrandom from 'seedrandom';

// if I ever want to shuffle using seeded fisher-yates algorithm
// https://stackoverflow.com/questions/76705788/how-to-seed-lodash-random-number-generator

export function getRandomSeed(){
    return Math.random().toString(36).slice(7)
}

export function generateCoopBoards (seed : string) : [Color[][],Color[][]]{

    const orig = Math.random
    seedrandom(seed, {global: true})

    const _ = _lodash.runInContext()

    const teamA_board = _.chunk(
        _.shuffle(getFlatBoard()),
        5
    )
    const firstBoard = teamA_board.flat(2).map((v,i)=>{ return {color: v, originalIndex: i} })
    const firstAssassins = firstBoard.filter((v)=>v.color == Color.BLACK)

    const fixAssassin = firstAssassins.splice(Math.floor(Math.random()*firstAssassins.length),1)[0]
    const fixGreen = firstAssassins.splice(Math.floor(Math.random()*firstAssassins.length),1)[0]
    fixGreen.color = Color.GREEN
    const fixGray = firstAssassins.splice(Math.floor(Math.random()*firstAssassins.length),1)[0]
    fixGray.color = Color.GRAY
    
    

    const sharedGreens = firstBoard.filter((v)=>v.color == Color.GREEN)
    
    while(sharedGreens.length > 3){
        const i = Math.floor(Math.random()*sharedGreens.length)
        sharedGreens.splice(i,1)
    }


    const flatTeamB = _.shuffle(getFlatBoard(12,5,2))
    const fixedTiles = sharedGreens.concat(...[fixAssassin,fixGray,fixGreen]).sort((a,b)=> a.originalIndex > b.originalIndex ? 1 : -1)
    fixedTiles.forEach((v)=>flatTeamB.splice(v.originalIndex,0,v.color))
    const teamB_board = _.chunk(
        flatTeamB,
        5
    )
    Math.random = orig
    return [teamA_board,teamB_board]
}

export function getFlatBoard(grays = 13, greens = 9, blacks = 3 ){
    return [
          ...(Array.from({ length: grays }).fill(Color.GRAY) as Color[]),
          ...(Array.from({ length: greens }).fill(Color.GREEN) as Color[]),
          ...(Array.from({ length: blacks }).fill(Color.BLACK) as Color[]),
        ]
}