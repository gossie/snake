import '@gossie/array-pipe';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { Direction } from './direction';
import Event, { EventType } from './event';
import FoodField from './food-field';
import { LineObstacle, Obstacle } from './obstacle';
import Position from './position';
import Snake from './snake';

export default class Game {

    private gameId = -1;
    private eventNr = 0;
    private snake: Snake;
    private points = 0;
    private field: FoodField;
    private obstacles: Array<Obstacle> = [];
    private currentDirection: Direction = Direction.UP;
    private subscription: Subscription;
    private gameSubject = new BehaviorSubject<Event>(null);
    private readonly allowedDirections = new Map<Direction, Set<Direction>>([
        [Direction.UP, new Set([Direction.LEFT, Direction.RIGHT])],
        [Direction.LEFT, new Set([Direction.UP, Direction.DOWN])],
        [Direction.RIGHT, new Set([Direction.UP, Direction.DOWN])],
        [Direction.DOWN, new Set([Direction.LEFT, Direction.RIGHT])]
    ]);

    constructor(private width: number, private height: number) {}

    public start(): void {
        ++this.gameId;
        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        this.snake = new Snake(Math.round(this.width / 2), Math.round(this.height / 2));
        this.calculateNewFoodField();
        this.obstacles = [];
        this.points = 0;
        this.currentDirection = Direction.UP;

        this.subscription = interval(75)
            .pipe(
                tap(() => this.snake.move(this.currentDirection)),
                tap(() => this.checkForCollision()),
                filter(() => this.isEqualPosition(this.field.position, this.snake.head.position)),
                tap(() => this.eat()),
                tap(() => this.handleObstacleCreation()),
                tap(() => this.calculateNewFoodField())
            )
            .subscribe(
                () => this.gameSubject.next({
                    gameId: this.gameId,
                    nr: this.eventNr++,
                    type: EventType.EAT,
                    payload: {
                        snake: this.snake,
                        foodField: this.field,
                        obstacles: this.obstacles,
                        direction: this.currentDirection,
                        points: this.points
                    }
                }),
                (e: Error) => {
                    this.gameSubject.next({
                        gameId: this.gameId,
                        nr: this.eventNr++,
                        type: EventType.ERROR,
                        msg: e.message
                    });
                    this.subscription.unsubscribe();
                    this.subscription = undefined;
                    ++this.gameId;
                }
            );

        this.gameSubject.next({
            gameId: this.gameId,
            nr: this.eventNr++,
            type: EventType.START,
            payload: {
                snake: this.snake,
                foodField: this.field,
                obstacles: this.obstacles,
                direction: this.currentDirection,
                points: this.points
            }
        });
    }

    public observeGame(): Observable<Event> {
        return this.gameSubject.asObservable()
            .pipe(
                filter((event: Event) => event !== null),
                filter((event: Event) => event.gameId === this.gameId)
            );
    }

    public setDirection(direction: Direction): void {
        if (this.allowedDirections.get(this.currentDirection).has(direction)) {
            this.currentDirection = direction;
        }
    }

    private eat(): void {
        this.snake.eat();
        ++this.points;
    }

    private handleObstacleCreation(): void {
        if (this.points === 10) {
            const obstacleSubscription = this.observeGame()
                .subscribe((event: Event) => {
                    if (event.type === EventType.START || event.type === EventType.ERROR) {
                        obstacleSubscription.unsubscribe();
                    } else {
                        if (this.obstacles.length === 0) {
                            this.obstacles.push(new LineObstacle({ x: 0, y: this.height / 3 }, 1, false ));
                            this.obstacles.push(new LineObstacle({ x: this.width - 1, y: this.height / 3 * 2 }, 1, false ));
                        } else {
                            const obstacle1 = (<LineObstacle> this.obstacles[0]);
                            const obstacle2 = (<LineObstacle> this.obstacles[1]);
                            if (obstacle1.length < 10) {
                                obstacle1.length = obstacle1.length + 1;
                                obstacle1.solid = obstacle1.length === 10;
                                obstacle2.length = obstacle2.length + 1;
                                obstacle2.position.x = this.width - obstacle2.length;
                                obstacle2.solid = obstacle2.length === 10;
                            } else {
                                obstacleSubscription.unsubscribe();
                            }
                        }
                    }
                });
        }
    }

    private checkForCollision(): void {
        if (this.isNotOnTheField()) {
            throw Error('border crossed');
        } else if (this.crashedIntoObstacle()) {
            throw Error('snake crashed into obstacle');
        } else {
            this.gameSubject.next({
                gameId: this.gameId,
                nr: this.eventNr++,
                type: EventType.MOVE,
                payload: {
                    snake: this.snake,
                    foodField: this.field,
                    obstacles: this.obstacles,
                    direction: this.currentDirection,
                    points: this.points
                }
            });
        }
    }

    private isNotOnTheField(): boolean {
        return this.snake.head.position.y < 0
            || this.snake.head.position.x < 0
            || this.snake.head.position.y >= this.height
            || this.snake.head.position.x >= this.width;
    }

    private crashedIntoObstacle(): boolean {
        return this.obstacles.some((obstacle: LineObstacle) => obstacle.collides(this.snake.head.position));
    }

    private calculateNewFoodField(): void {
        let newFoodPosition = {
            x: Math.round(Math.random() * (this.width - 1)),
            y: Math.round(Math.random() * (this.height - 1))
        };
        while (this.obstacles.some((obstacle: Obstacle) => obstacle.collides(newFoodPosition))) {
            newFoodPosition = {
                x: Math.round(Math.random() * (this.width - 1)),
                y: Math.round(Math.random() * (this.height - 1))
            };
        }

        this.field = {
            position: newFoodPosition
        };
    }

    private isEqualPosition(pos1: Position, pos2: Position): boolean {
        return pos1.x === pos2.x
            && pos1.y === pos2.y;
    }
}
