import { Direction } from './direction';
import FoodField from './food-field';
import { Obstacle } from './obstacle';
import Snake from './snake';

export enum EventType {
    START,
    MOVE,
    EAT,
    ERROR
}

export default interface Event {
    gameId: number;
    nr: number;
    type: EventType;
    msg?: string;
    payload?: {
        snake: Snake;
        foodField: FoodField;
        obstacles: Array<Obstacle>;
        direction: Direction;
        points: number;
    };
}
