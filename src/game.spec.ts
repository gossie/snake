import { Direction } from './direction';
import Event, { EventType } from './event';
import Game from './game';
import { LineObstacle } from './obstacle';
import Position from './position';
import Snake from './snake';

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

    it('should have one food field after starting the game', (done) => {
        const game = new Game(75, 100);

        const gameSubscription = game.observeGame()
            .subscribe((event: Event) => {
                expect(event.payload.foodField.position.x).toBeGreaterThanOrEqual(0);
                expect(event.payload.foodField.position.x).toBeLessThan(75);
                expect(event.payload.foodField.position.y).toBeGreaterThanOrEqual(0);
                expect(event.payload.foodField.position.y).toBeLessThan(100);
                gameSubscription.unsubscribe();
                done();
            });

        game.start();
    });

    it('should have a snake after starting the game', (done) => {
        const game = new Game(75, 100);

        const gameSubscription = game.observeGame()
            .subscribe((event: Event) => {
                expect(event.payload.snake).toBeDefined();
                gameSubscription.unsubscribe();
                done();
            });

        game.start();
    });

    it('should eat', (done) => {
        const game = new Game(75, 100);

        let foodPosition: Position;
        const gameSubscription = game.observeGame()
            .subscribe((event: Event) => {
                if (event.type === EventType.START) {
                    expect(event.payload.points).toBe(0);
                    foodPosition = event.payload.foodField.position;
                    moveInFoodDirection(game, event.payload.snake, foodPosition);
                    clock.tick(75);
                } else if (event.type === EventType.MOVE) {
                    moveInFoodDirection(game, event.payload.snake, foodPosition);
                    clock.tick(75);
                } else if (event.type === EventType.EAT) {
                    expect(event.payload.points).toBe(1);
                    expect(event.payload.snake.head.next).toBeDefined();
                    expect(event.payload.foodField.position).toBeDefined();
                    expect(event.payload.foodField.position).not.toEqual(foodPosition);
                    gameSubscription.unsubscribe();
                    done();
                }
            });

        game.start();
    });

    it('should reset game when started again', (done) => {
        const game = new Game(75, 100);

        let firstStartCall = true;
        let secondStartPerformed = false;
        let secondStartX: number;
        let secondStartY: number;
        const gameSubscription = game.observeGame()
            .subscribe((event: Event) => {
                if (event.type === EventType.START && firstStartCall) {
                    firstStartCall = false;
                    expect(event.payload.points).toBe(0);
                    moveInFoodDirection(game, event.payload.snake, event.payload.foodField.position);
                    clock.tick(75);
                } else if (event.type === EventType.MOVE && !secondStartPerformed) {
                    moveInFoodDirection(game, event.payload.snake, event.payload.foodField.position);
                    clock.tick(75);
                } else if (event.type === EventType.START && !firstStartCall) {
                    secondStartPerformed = true;
                    expect(event.payload.points).toBe(0);
                    expect(event.payload.snake.head.next).toBeUndefined();

                    secondStartX = event.payload.snake.head.position.x;
                    secondStartY = event.payload.snake.head.position.y;

                    clock.tick(75);
                } else if (event.type === EventType.EAT) {
                    game.setDirection(Direction.LEFT);
                    game.start();
                    clock.tick(75);
                } else if (event.type === EventType.MOVE && secondStartPerformed) {
                    expect(event.payload.snake.head.position.x).toBe(secondStartX);
                    expect(event.payload.snake.head.position.y).toBe(secondStartY - 1);

                    gameSubscription.unsubscribe();
                    done();
                }
            });

        game.start();
    });

    describe('directions', () => {

        it('should not accept down as direction when currently moving up', (done) => {
            const game = new Game(75, 100);

            let startX: number;
            let startY: number;
            game.observeGame()
                .subscribe((event: Event) => {
                    if (event.type === EventType.START) {
                        startX = event.payload.snake.head.position.x;
                        startY = event.payload.snake.head.position.y;
                        game.setDirection(Direction.UP);
                        clock.tick(75);
                    } else if (event.type === EventType.MOVE) {
                        switch (event.nr) {
                            case 1:
                                expect(event.payload.snake.head.position.x).toBe(startX);
                                expect(event.payload.snake.head.position.y).toBe(startY - 1);
                                game.setDirection(Direction.DOWN);
                                clock.tick(75);
                                break;
                            case 2:
                                expect(event.payload.snake.head.position.x).toBe(startX);
                                expect(event.payload.snake.head.position.y).toBe(startY - 2);
                                done();
                        }
                    }
                });

            game.start();
        });

        it('should not accept up as direction when currently moving down', (done) => {
            const game = new Game(75, 100);

            let startX: number;
            let startY: number;
            game.observeGame()
                .subscribe((event: Event) => {
                    if (event.type === EventType.START) {
                        startX = event.payload.snake.head.position.x;
                        startY = event.payload.snake.head.position.y;
                        game.setDirection(Direction.LEFT);
                        game.setDirection(Direction.DOWN);
                    } else if (event.type === EventType.MOVE) {
                        switch (event.nr) {
                            case 1:
                                expect(event.payload.snake.head.position.x).toBe(startX - 1);
                                expect(event.payload.snake.head.position.y).toBe(startY);
                                game.setDirection(Direction.UP);
                                break;
                            case 2:
                                expect(event.payload.snake.head.position.x).toBe(startX - 1);
                                expect(event.payload.snake.head.position.y).toBe(startY + 1);
                                game.setDirection(Direction.UP);
                                break;
                            case 3:
                                expect(event.payload.snake.head.position.x).toBe(startX - 1);
                                expect(event.payload.snake.head.position.y).toBe(startY + 2);
                                done();
                        }
                    }
                    clock.tick(75);
                });

            game.start();
        });

        it('should not accept right as direction when currently moving left', (done) => {
            const game = new Game(75, 100);

            let startX: number;
            let startY: number;
            game.observeGame()
                .subscribe((event: Event) => {
                    if (event.type === EventType.START) {
                        startX = event.payload.snake.head.position.x;
                        startY = event.payload.snake.head.position.y;
                        game.setDirection(Direction.LEFT);
                        clock.tick(75);
                    } else if (event.type === EventType.MOVE) {
                        switch (event.nr) {
                            case 1:
                                expect(event.payload.snake.head.position.x).toBe(startX - 1);
                                expect(event.payload.snake.head.position.y).toBe(startY);
                                game.setDirection(Direction.RIGHT);
                                clock.tick(75);
                                break;
                            case 2:
                                expect(event.payload.snake.head.position.x).toBe(startX - 2);
                                expect(event.payload.snake.head.position.y).toBe(startY);
                                done();
                        }
                    }
                });

            game.start();
        });

        it('should not accept left as direction when currently moving right', (done) => {
            const game = new Game(75, 100);

            let startX: number;
            let startY: number;
            game.observeGame()
                .subscribe((event: Event) => {
                    if (event.type === EventType.START) {
                        startX = event.payload.snake.head.position.x;
                        startY = event.payload.snake.head.position.y;
                        game.setDirection(Direction.RIGHT);
                        clock.tick(75);
                    } else if (event.type === EventType.MOVE) {
                        switch (event.nr) {
                            case 1:
                                expect(event.payload.snake.head.position.x).toBe(startX + 1);
                                expect(event.payload.snake.head.position.y).toBe(startY);
                                game.setDirection(Direction.LEFT);
                                clock.tick(75);
                                break;
                            case 2:
                                expect(event.payload.snake.head.position.x).toBe(startX + 2);
                                expect(event.payload.snake.head.position.y).toBe(startY);
                                done();
                        }
                    }
                });

            game.start();
        });

        it('should should only accept one direction command per frame', (done) => {
            const game = new Game(75, 100);

            let startX: number;
            let startY: number;
            game.observeGame()
                .subscribe((event: Event) => {
                    if (event.type === EventType.START) {
                        startX = event.payload.snake.head.position.x;
                        startY = event.payload.snake.head.position.y;
                    }

                    if (event.nr === 2) {
                        expect(event.payload.snake.head.position.x).toBe(startX + 1);
                        expect(event.payload.snake.head.position.y).toBe(startY + 1);
                        done();
                    }
                });

            game.start();
            game.setDirection(Direction.RIGHT);
            game.setDirection(Direction.DOWN);
            clock.tick(75);
            clock.tick(75);
        });

    });

    describe('snake crosses borders', () => {

        it('should fail when upper border is crossed', (done) => {
            const game = new Game(58, 78);

            let startY: number;
            const gameSubscription = game.observeGame()
                .subscribe((event: Event) => {
                    if (event.type === EventType.START) {
                        game.setDirection(Direction.UP);
                        startY = event.payload.snake.head.position.y;
                    } else if (event.nr === startY + 1) {
                        expect(event.type).toBe(EventType.ERROR);
                        expect(event.msg).toBe('border crossed');
                        gameSubscription.unsubscribe();
                        done();
                    }
                    clock.tick(75);
                });

            game.start();
        });

        it('should fail when left border is crossed', (done) => {
            const game = new Game(58, 78);

            let startX: number;
            const gameSubscription = game.observeGame()
                .subscribe((event: Event) => {
                    if (event.type === EventType.START) {
                        game.setDirection(Direction.LEFT);
                        startX = event.payload.snake.head.position.x;
                    } else if (event.nr === startX + 1) {
                        expect(event.type).toBe(EventType.ERROR);
                        expect(event.msg).toBe('border crossed');
                        gameSubscription.unsubscribe();
                        done();
                    }
                    clock.tick(75);
                });

            game.start();
        });

        it('should fail when right border is crossed', (done) => {
            const game = new Game(58, 78);

            let startX: number;
            const gameSubscription = game.observeGame()
                .subscribe((event: Event) => {
                    if (event.type === EventType.START) {
                        game.setDirection(Direction.RIGHT);
                        startX = event.payload.snake.head.position.x;
                    } else if (event.nr === 58 - startX) {
                        expect(event.type).toBe(EventType.ERROR);
                        expect(event.msg).toBe('border crossed');
                        gameSubscription.unsubscribe();
                        done();
                    }
                    clock.tick(75);
                });

            game.start();
        });

        it('should fail when botton border is crossed', (done) => {
            const game = new Game(58, 78);

            let startY: number;
            const gameSubscription = game.observeGame()
                .subscribe((event: Event) => {
                    if (event.type === EventType.START) {
                        game.setDirection(Direction.LEFT);
                        game.setDirection(Direction.DOWN);
                        startY = event.payload.snake.head.position.y;
                    } else if (event.nr === 79 - startY) {
                        expect(event.type).toBe(EventType.ERROR);
                        expect(event.msg).toBe('border crossed');
                        gameSubscription.unsubscribe();
                        done();
                    }
                    clock.tick(75);
                });

            game.start();
        });

    });

    describe('obstacles', () => {

        it('should appear after ten points', (done) => {
            const game = new Game(50, 60);

            let numberOfTicksAfterObstacleAppearance = 0;
            const gameSubscription = game.observeGame()
                .subscribe((event: Event) => {
                    if (event.type === EventType.START) {
                        moveInFoodDirection(game, event.payload.snake, event.payload.foodField.position);
                        clock.tick(75);
                    } else if (event.type === EventType.MOVE) {
                        moveInFoodDirection(game, event.payload.snake, event.payload.foodField.position);
                        if (event.payload.points >= 10) {
                            ++numberOfTicksAfterObstacleAppearance;
                            expect(event.payload.obstacles.length).toBe(2);
                            const obstacle1: LineObstacle = <LineObstacle> event.payload.obstacles[0];
                            const obstacle2: LineObstacle = <LineObstacle> event.payload.obstacles[1];
                            if (obstacle1.length === 10 && obstacle2.length === 10) {
                                expect(obstacle1.solid).toBeTrue();
                                expect(obstacle2.solid).toBeTrue();
                                gameSubscription.unsubscribe();
                                done();
                            } else {
                                expect(obstacle1.position.x).toBe(0);
                                expect(obstacle1.position.y).toBe(20);
                                expect(obstacle1.length).toBe(numberOfTicksAfterObstacleAppearance + 1);
                                expect(obstacle1.solid).toBeFalse();
                                expect(obstacle2.position.x).toBe(49 - numberOfTicksAfterObstacleAppearance);
                                expect(obstacle2.position.y).toBe(40);
                                expect(obstacle2.length).toBe(numberOfTicksAfterObstacleAppearance + 1);
                                expect(obstacle2.solid).toBeFalse();
                            }
                        } else {
                            clock.tick(75);
                        }
                    } else if (event.type === EventType.EAT) {
                        if (event.payload.points === 10) {
                            expect(event.payload.obstacles.length).toBe(2);
                            const obstacle1: LineObstacle = <LineObstacle> event.payload.obstacles[0];
                            const obstacle2: LineObstacle = <LineObstacle> event.payload.obstacles[1];
                            expect(obstacle1.position.x).toBe(0);
                            expect(obstacle1.position.y).toBe(20);
                            expect(obstacle1.length).toBe(1);
                            expect(obstacle1.solid).toBeFalse();
                            expect(obstacle2.position.x).toBe(49);
                            expect(obstacle2.position.y).toBe(40);
                            expect(obstacle2.length).toBe(1);
                            expect(obstacle2.solid).toBeFalse();
                        } else {
                            moveInFoodDirection(game, event.payload.snake, event.payload.foodField.position);
                            clock.tick(75);
                            expect(event.payload.obstacles.length).toBe(0);
                        }
                    }
                });

            game.start();
        });

        it('should reset obstacles when restarting', (done) => {
            const game = new Game(50, 60);

            const gameSubscription = game.observeGame()
                .subscribe((event: Event) => {
                    if (event.type === EventType.START && event.nr === 0) {
                        moveInFoodDirection(game, event.payload.snake, event.payload.foodField.position);
                        clock.tick(75);
                    } else if (event.type === EventType.MOVE) {
                        moveInFoodDirection(game, event.payload.snake, event.payload.foodField.position);
                        clock.tick(75);
                    } else if (event.type === EventType.START && event.nr > 0) {
                        expect(event.payload.obstacles.length).toBe(0);
                        gameSubscription.unsubscribe();
                        done();
                    } else if (event.type === EventType.EAT) {
                        if (event.payload.points === 10) {
                            expect(event.payload.obstacles.length).toBe(2);
                            game.start();
                        } else {
                            moveInFoodDirection(game, event.payload.snake, event.payload.foodField.position);
                            clock.tick(75);
                            expect(event.payload.obstacles.length).toBe(0);
                        }
                    }
                });

            game.start();
        });

        it('should fail when snake crashes into an obstacles', (done) => {
            const game = new Game(50, 60);

            const gameSubscription = game.observeGame()
                .subscribe((event: Event) => {
                    if (event.type === EventType.START) {
                        moveInFoodDirection(game, event.payload.snake, event.payload.foodField.position);
                        clock.tick(75);
                    } else if (event.type === EventType.MOVE && event.payload.points < 10) {
                        moveInFoodDirection(game, event.payload.snake, event.payload.foodField.position);
                        clock.tick(75);
                    } else if (event.type === EventType.EAT) {
                        if (event.payload.obstacles.length === 0) {
                            moveInFoodDirection(game, event.payload.snake, event.payload.foodField.position);
                            clock.tick(75);
                            expect(event.payload.obstacles.length).toBe(0);
                        }
                    } else if (event.type === EventType.MOVE && event.payload.points >= 10) {
                        if (event.payload.snake.head.position.x > 5) {
                            game.setDirection(Direction.LEFT);
                        } else {
                            if (event.payload.snake.head.position.y > 20) {
                                game.setDirection(Direction.UP);
                            } else {
                                game.setDirection(Direction.DOWN);
                            }
                        }
                        clock.tick(75);
                    } else if (event.type === EventType.ERROR) {
                        expect(event.msg).toBe('snake crashed into obstacle');
                        gameSubscription.unsubscribe();
                        done();
                    }
                });

            game.start();
        });

    });

    const moveInFoodDirection = (game: Game, snake: Snake, foodPosition: Position) => {
        if (foodPosition.x !== snake.head.position.x) {
            const direction = foodPosition.x < snake.head.position.x ? Direction.LEFT : Direction.RIGHT;
            game.setDirection(direction);
        } else {
            const direction = foodPosition.y < snake.head.position.y ? Direction.UP : Direction.DOWN;
            game.setDirection(direction);
        }
    };

});
