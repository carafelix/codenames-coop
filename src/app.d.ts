
export interface boardProps {
    board: cardData[],
    team: 'a' | 'b',
    marked: any,
    words: string[],
    handleMarked: Function,
    rotate: number;
}
export interface teamProps {
    teamA: Color[],
    teamB: Color[]
}

export type angleStates = 0 | 1 | 2 | 3

import type { switchTriStates, tristateProps } from "./components/tristateSwitch/ElementOptionSwitch";
export { switchTriStates, tristateProps, angleStates }