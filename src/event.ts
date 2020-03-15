import { Direction } from './direction';
import FoodField from './food-field';
import Snake from './snake';

export default interface Event {
    msg?: string;
    payload?: {
        snake: Snake;
        foodField: FoodField;
        direction: Direction;
        points: number;
    };
}
