import _lodash from 'lodash';
import Color from '../utils/colors.ts';
import seedrandom from 'seedrandom';

// if I ever want to shuffle using seeded fisher-yates algorithm
// https://stackoverflow.com/questions/76705788/how-to-seed-lodash-random-number-generator

export function getRandomSeed() {
    return Math.random().toString(36).slice(7)
}

export function generateFlatCoopBoards(seed: string): [Color[], Color[]] {

    const orig = Math.random
    seedrandom(seed, { global: true })

    const _ = _lodash.runInContext()

    const teamA_board = _.shuffle(getFlatBoard())

    const firstBoard = teamA_board.map((v, i) => { return { color: v, i: i } })
    const firstAssassins = firstBoard.filter((v) => v.color == Color.BLACK)

    const fixAssassin = firstAssassins.splice(Math.floor(Math.random() * firstAssassins.length), 1)[0]
    const fixGreen = firstAssassins.splice(Math.floor(Math.random() * firstAssassins.length), 1)[0]
    fixGreen.color = Color.GREEN
    const fixGray = firstAssassins.splice(Math.floor(Math.random() * firstAssassins.length), 1)[0]
    fixGray.color = Color.GRAY



    const sharedGreens = firstBoard.filter((v) => v.color == Color.GREEN)

    while (sharedGreens.length > 3) {
        const i = Math.floor(Math.random() * sharedGreens.length)
        sharedGreens.splice(i, 1)
    }

    const fixedTiles = sharedGreens.concat(...[fixAssassin, fixGray, fixGreen]).sort((a, b) => a.i > b.i ? 1 : -1)

    // slow, must avoid reshuffling the array for getting no more than 3 matches

    let flatTeamB: Color[];
    let greensInTeamB;
    do {
        flatTeamB = _.shuffle(getFlatBoard(12, 5, 2))
        fixedTiles.forEach((v) => flatTeamB.splice(v.i, 0, v.color))
        greensInTeamB = flatTeamB.map((v, i) => {
            return {
                color: v,
                i
            }
        }).filter((v) => v.color !== Color.GREEN).map((v) => `${v.color},${v.i}`)
    }
    while (_.intersection(greensInTeamB, teamA_board.map((v, i) => `${v},${i}`)).length !== 8)

    const teamB_board = flatTeamB
    Math.random = orig
    return [teamA_board, teamB_board]
}

export function getFlatBoard(grays = 13, greens = 9, blacks = 3) {
    return [
        ...(Array.from({ length: grays }).fill(Color.GRAY) as Color[]),
        ...(Array.from({ length: greens }).fill(Color.GREEN) as Color[]),
        ...(Array.from({ length: blacks }).fill(Color.BLACK) as Color[]),
    ]
}

function swapTwo(array: Color[], index1: number, index2: number) {
    [array[index1], array[index2]] = [array[index2], array[index1]];
    return array
}