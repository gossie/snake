import { Direction } from './direction';

export default interface Event {
    msg?: string;
    payload?: {
        direction: Direction;
    };
}
