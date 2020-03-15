import Position from './position';

export interface Obstacle {

};

export interface LineObstacle extends Obstacle {
    position: Position;
    length: number;
}