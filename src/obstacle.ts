import Position from './position';

export interface Obstacle {
    solid: boolean;
}

export interface LineObstacle extends Obstacle {
    position: Position;
    length: number;
}
