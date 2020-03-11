import { Direction } from './direction';
import Game from './game';

const sinon = require('sinon');

describe('game', () => {

    let clock;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
    });

    it('should be initialized', () => {
        expect(new Game(100, 75)).toBeDefined();
    });

    it('should have one food field after starting the game', () => {
        const game = new Game(75, 100);

        game.start();

        expect(game.foodField.position.x).toBeGreaterThanOrEqual(0);
        expect(game.foodField.position.x).toBeLessThan(75);
        expect(game.foodField.position.y).toBeGreaterThanOrEqual(0);
        expect(game.foodField.position.y).toBeLessThan(100);
    });

    it('should have a snake after starting the game', () => {
        const game = new Game(75, 100);

        game.start();

        expect(game.snake).toBeDefined();
    });

    it('should eat', () => {
        const game = new Game(75, 100);

        game.start();

        const foodPosition = game.foodField.position;

        let direction = foodPosition.x < game.snake.head.position.x ? Direction.LEFT : Direction.RIGHT;
        game.setDirection(direction);

        while (game.snake.head.position.x !== foodPosition.x) {
            clock.tick(50);
        }

        direction = foodPosition.y < game.snake.head.position.y ? Direction.UP : Direction.DOWN;
        game.setDirection(direction);

        while (game.snake.head.position.y !== foodPosition.y) {
            clock.tick(50);
        }

        expect(game.snake.head.next).toBeDefined();
        expect(game.foodField.position).toBeDefined();
        expect(game.foodField.position).not.toEqual(foodPosition);
    });

});
