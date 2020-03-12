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

        expect(game.points).toBe(0);

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

        expect(game.points).toBe(1);
        expect(game.snake.head.next).toBeDefined();
        expect(game.foodField.position).toBeDefined();
        expect(game.foodField.position).not.toEqual(foodPosition);
    });

    it('should reset game when started again', () => {
        const game = new Game(75, 100);

        expect(game.points).toBe(0);

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
        game.setDirection(Direction.LEFT);

        game.start();

        expect(game.points).toBe(0);
        expect(game.snake.head.next).toBeUndefined();

        const startX = game.snake.head.position.x;
        const startY = game.snake.head.position.y;

        clock.tick(50);

        expect(game.snake.head.position.x).toBe(startX);
        expect(game.snake.head.position.y).toBe(startY - 1);
    });

    describe('directions', () => {

        it('should not accept down as direction when currently moving up', () => {
            const game = new Game(75, 100);

            game.start();
            game.setDirection(Direction.UP);
            const startX = game.snake.head.position.x;
            const startY = game.snake.head.position.y;

            clock.tick(50);

            expect(game.snake.head.position.x).toBe(startX);
            expect(game.snake.head.position.y).toBe(startY - 1);

            game.setDirection(Direction.DOWN);
            clock.tick(50);

            expect(game.snake.head.position.x).toBe(startX);
            expect(game.snake.head.position.y).toBe(startY - 2);
        });

        it('should not accept up as direction when currently moving down', () => {
            const game = new Game(75, 100);

            game.start();
            game.setDirection(Direction.LEFT);
            game.setDirection(Direction.DOWN);
            const startX = game.snake.head.position.x;
            const startY = game.snake.head.position.y;

            clock.tick(50);

            expect(game.snake.head.position.x).toBe(startX);
            expect(game.snake.head.position.y).toBe(startY + 1);

            game.setDirection(Direction.UP);
            clock.tick(50);

            expect(game.snake.head.position.x).toBe(startX);
            expect(game.snake.head.position.y).toBe(startY + 2);
        });

        it('should not accept right as direction when currently moving left', () => {
            const game = new Game(75, 100);

            game.start();
            game.setDirection(Direction.LEFT);
            const startX = game.snake.head.position.x;
            const startY = game.snake.head.position.y;

            clock.tick(50);

            expect(game.snake.head.position.x).toBe(startX - 1);
            expect(game.snake.head.position.y).toBe(startY);

            game.setDirection(Direction.RIGHT);
            clock.tick(50);

            expect(game.snake.head.position.x).toBe(startX - 2);
            expect(game.snake.head.position.y).toBe(startY);
        });

        it('should not accept left as direction when currently moving right', () => {
            const game = new Game(75, 100);

            game.start();
            game.setDirection(Direction.RIGHT);
            const startX = game.snake.head.position.x;
            const startY = game.snake.head.position.y;

            clock.tick(50);

            expect(game.snake.head.position.x).toBe(startX + 1);
            expect(game.snake.head.position.y).toBe(startY);

            game.setDirection(Direction.LEFT);
            clock.tick(50);

            expect(game.snake.head.position.x).toBe(startX + 2);
            expect(game.snake.head.position.y).toBe(startY);
        });

    });

    describe('snake crosses borders', () => {

        it('should fail when upper border is crossed', (done) => {
            const game = new Game(58, 78);

            game.start();
            game.setDirection(Direction.UP);
            const startY = game.snake.head.position.y;

            let numberOfCalls = 0;
            const gameSubscription = game.observeGame()
                .subscribe((msg: string) => {
                    ++numberOfCalls;
                    if (numberOfCalls === startY + 1) {
                        expect(msg).toBe('Error');
                        gameSubscription.unsubscribe();
                        done();
                    } else {
                        expect(msg).toBeUndefined()
                    }
                });

            for (let i = startY; i >= 0; i--) {
                clock.tick(50);
            }
        });

        it('should fail when left border is crossed', (done) => {
            const game = new Game(58, 78);

            game.start();
            game.setDirection(Direction.LEFT);
            const startX = game.snake.head.position.x;

            let numberOfCalls = 0;
            const gameSubscription = game.observeGame()
                .subscribe((msg: string) => {
                    ++numberOfCalls;
                    if (numberOfCalls === startX + 1) {
                        expect(msg).toBe('Error');
                        gameSubscription.unsubscribe();
                        done();
                    } else {
                        expect(msg).toBeUndefined()
                    }
                });

            for (let i = startX; i >= 0; i--) {
                clock.tick(50);
            }
        });

        it('should fail when right border is crossed', (done) => {
            const game = new Game(58, 78);

            game.start();
            game.setDirection(Direction.RIGHT);
            const startX = game.snake.head.position.x;

            let numberOfCalls = 0;
            const gameSubscription = game.observeGame()
                .subscribe((msg: string) => {
                    ++numberOfCalls;
                    if (numberOfCalls === 58 - startX) {
                        expect(msg).toBe('Error');
                        gameSubscription.unsubscribe();
                        done();
                    } else {
                        expect(msg).toBeUndefined();
                    }
                });

            for (let i = startX; i <= 58; i++) {
                clock.tick(50);
            }
        });

        it('should fail when botton border is crossed', (done) => {
            const game = new Game(58, 78);

            game.start();
            game.setDirection(Direction.LEFT);
            game.setDirection(Direction.DOWN);
            const startY = game.snake.head.position.y;

            let numberOfCalls = 0;
            const gameSubscription = game.observeGame()
                .subscribe((msg: string) => {
                    ++numberOfCalls;
                    if (numberOfCalls === 78 - startY) {
                        expect(msg).toBe('Error');
                        gameSubscription.unsubscribe();
                        done();
                    } else {
                        expect(msg).toBeUndefined();
                    }
                });

            for (let i = startY; i <= 78; i++) {
                clock.tick(50);
            }
        });
    });

});
