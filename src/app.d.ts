
export interface boardProps {
    board: cardData[],
    team: 'a' | 'b',
    marked: any,
    words: string[],
    handleMarked: Function
}
export interface teamProps {
    teamA: Color[],
    teamB: Color[]
}

import type { switchTriStates, tristateProps } from "./components/tristateSwitch/ElementOptionSwitch";
export { switchTriStates, tristateProps }