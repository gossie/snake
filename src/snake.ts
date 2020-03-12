import { Direction } from './direction';
import Position from './position';

interface Node {

    prev?: Node;
    next?: Node;
    position: Position;

}

export default class Snake {

    private _head: Node;
    private lastNode: Node;
    private direction = Direction.UP;

    constructor(x: number, y: number) {
        this._head = {
            position: {
                x,
                y
            }
        };
        this.lastNode = this._head;
    }

    public move(direction: Direction): void {
        let node = this.lastNode;
        while (node) {
            if (node.prev) {
                node.position = node.prev.position;
            }
            node = node.prev;
        }

        this.direction = direction;
        switch (direction) {
            case Direction.UP:
                this.head.position = {
                    x: this._head.position.x,
                    y: this._head.position.y - 1
                };
                break;
            case Direction.LEFT:
                this.head.position = {
                    x: this._head.position.x - 1,
                    y: this._head.position.y
                };
                break;
            case Direction.RIGHT:
                this.head.position = {
                    x: this._head.position.x + 1,
                    y: this._head.position.y
                };
                break;
            case Direction.DOWN:
                this.head.position = {
                    x: this._head.position.x,
                    y: this._head.position.y + 1
                };
                break;
        }

        node = this.head.next;
        while (node) {
            if (this.head.position.x === node.position.x && this.head.position.y === node.position.y) {
                throw new Error('snake crashed into itself');
            }
            node = node.next;
        }
    }

    public eat(): void {
        console.debug('Snake: I\'m eating!');
        this.lastNode.next = {
            prev: this.lastNode,
            position: this.determinePositionOfNewNode(this.lastNode.position)
        };
        this.lastNode = this.lastNode.next;
    }

    private determinePositionOfNewNode(position: Position): Position {
        switch(this.direction) {
            case Direction.UP:
                return {
                    x: position.x,
                    y: position.y + 1
                };
            case Direction.LEFT:
                return {
                    x: position.x + 1,
                    y: position.y
                };
            case Direction.RIGHT:
                return {
                    x: position.x - 1,
                    y: position.y
                };
            case Direction.DOWN:
                return {
                    x: position.x,
                    y: position.y - 1
                };
        }
    }

    public get head(): Node {
        return this._head;
    }

    public get startPosition(): Position {
        return this._head.position;
    }
}
