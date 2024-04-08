
export interface boardProps {
    board: cardData[],
    team: 'a' | 'b',
    marked: any,
    curry: Function
}
export interface teamProps {
    teamA: Color[],
    teamB: Color[]
}
export interface cardData{
    color: Color,
    word: string | null
}

import type { switchTriStates, tristateProps } from "./components/tristateSwitch/ElementOptionSwitch";
export { switchTriStates, tristateProps }