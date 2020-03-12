import { Direction } from './direction';
import Snake from './snake';

describe('Snake', () => {

    it('should be initialized', () => {
        const snake = new Snake(50, 50);
        expect(snake.startPosition).toEqual({x: 50, y: 50});
    });

    it('should move left', () => {
        const snake = new Snake(50, 50);
        snake.move(Direction.LEFT);

        expect(snake.startPosition).toEqual({x: 49, y: 50});
    });

    it('should move right', () => {
        const snake = new Snake(50, 50);
        snake.move(Direction.RIGHT);

        expect(snake.startPosition).toEqual({x: 51, y: 50});
    });

    it('should move up', () => {
        const snake = new Snake(50, 50);
        snake.move(Direction.UP);

        expect(snake.startPosition).toEqual({x: 50, y: 49});
    });

    it('should move down', () => {
        const snake = new Snake(50, 50);
        snake.move(Direction.DOWN);

        expect(snake.startPosition).toEqual({x: 50, y: 51});
    });

    it('should eat after moving up', () => {
        const snake = new Snake(50, 50);
        snake.eat();

        expect(snake.head.position).toEqual({x: 50, y: 50});
        expect(snake.head.next.position).toEqual({x: 50, y: 51});
        expect(snake.head.next.prev).toBe(snake.head);
        expect(snake.head.prev).toBeUndefined();
        expect(snake.head.next.next).toBeUndefined();
    });

    it('should eat after moving left', () => {
        const snake = new Snake(50, 50);

        snake.move(Direction.LEFT);
        snake.eat();

        expect(snake.head.position).toEqual({x: 49, y: 50});
        expect(snake.head.next.position).toEqual({x: 50, y: 50});
        expect(snake.head.next.prev).toBe(snake.head);
        expect(snake.head.prev).toBeUndefined();
        expect(snake.head.next.next).toBeUndefined();
    });

    it('should eat after moving right', () => {
        const snake = new Snake(50, 50);

        snake.move(Direction.RIGHT);
        snake.eat();

        expect(snake.head.position).toEqual({x: 51, y: 50});
        expect(snake.head.next.position).toEqual({x: 50, y: 50});
        expect(snake.head.next.prev).toBe(snake.head);
        expect(snake.head.prev).toBeUndefined();
        expect(snake.head.next.next).toBeUndefined();
    });

    it('should eat after moving down', () => {
        const snake = new Snake(50, 50);

        snake.move(Direction.DOWN);
        snake.eat();

        expect(snake.head.position).toEqual({x: 50, y: 51});
        expect(snake.head.next.position).toEqual({x: 50, y: 50});
        expect(snake.head.next.prev).toBe(snake.head);
        expect(snake.head.prev).toBeUndefined();
        expect(snake.head.next.next).toBeUndefined();
    });

    it('should be followed by its tail', () => {
        const snake = new Snake(50, 50);

        snake.move(Direction.DOWN);
        snake.eat();
        snake.move(Direction.DOWN);
        snake.move(Direction.DOWN);

        expect(snake.head.position).toEqual({x: 50, y: 53});
        expect(snake.head.next.position).toEqual({x: 50, y: 52});
    });

    it('should crash when snake collides with itself', () => {
        const snake = new Snake(50, 50);

        snake.move(Direction.DOWN);
        snake.eat();
        snake.move(Direction.DOWN);
        snake.eat();
        snake.move(Direction.DOWN);
        snake.eat();
        snake.move(Direction.DOWN);
        snake.eat();
        snake.move(Direction.DOWN);
        snake.eat();
        snake.move(Direction.RIGHT);
        snake.move(Direction.UP);

        expect(() => snake.move(Direction.LEFT)).toThrowError('snake crashed into itself');
    });

});
