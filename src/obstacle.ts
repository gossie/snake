import Position from './position';

export interface Obstacle {
    solid: boolean;
    collides(position: Position): boolean;
}

export class LineObstacle implements Obstacle {

    constructor(private _position: Position,
                private _length: number,
                private _solid: boolean) {}

    public collides(position: Position): boolean {
        return this.position.y === position.y
            && position.x >= this.position.x
            && position.x < this.position.x + this.length;
    }

    public get position(): Position {
        return this._position;
    }

    public get length(): number {
        return this._length;
    }

    public set length(l: number) {
        this._length = l;
    }

    public get solid(): boolean {
        return this._solid;
    }

    public set solid(s: boolean) {
        this._solid = s;
    }
}
