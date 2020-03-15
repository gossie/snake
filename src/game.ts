import { interval, Observable, Subject, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { Direction } from './direction';
import Event from './event';
import FoodField from './food-field';
import { Obstacle } from './obstacle';
import Position from './position';
import Snake from './snake';

export default class Game {

    private _snake: Snake;
    private _points = 0;
    private field: FoodField;
    private _obstacles: Array<Obstacle> = [];
    private currentDirection: Direction = Direction.UP;
    private subscription: Subscription;
    private gameSubject = new Subject<Event>();
    private readonly allowedDirections = new Map<Direction, Set<Direction>>([
        [Direction.UP, new Set([Direction.LEFT, Direction.RIGHT])],
        [Direction.LEFT, new Set([Direction.UP, Direction.DOWN])],
        [Direction.RIGHT, new Set([Direction.UP, Direction.DOWN])],
        [Direction.DOWN, new Set([Direction.LEFT, Direction.RIGHT])]
    ]);

    constructor(private width: number, private height: number) {}

    public start(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        this._snake = new Snake(Math.round(this.width / 2), Math.round(this.height / 2));
        this.calculateNewFoodField();
        this._obstacles = [];
        this._points = 0;
        this.currentDirection = Direction.UP;

        this.subscription = interval(75)
            .pipe(
                tap(() => this.snake.move(this.currentDirection)),
                tap(() => this.checkBorderCollision()),
                filter(() => this.isEqualPosition(this.field.position, this.snake.head.position)),
                tap(() => this.eat()),
                tap(() => this.calculateNewFoodField()),
                tap(() => this.handleObstacleCreation())
            )
            .subscribe(
                () => this.gameSubject.next({
                        payload: {
                            direction: this.currentDirection
                        }
                    }),
                (e: Error) => {
                    this.gameSubject.next({ msg: e.message});
                    this.subscription.unsubscribe();
                    this.subscription = undefined;
                }
            );
    }

    public observeGame(): Observable<Event> {
        return this.gameSubject.asObservable();
    }

    public setDirection(direction: Direction): void {
        if (this.allowedDirections.get(this.currentDirection).has(direction)) {
            this.currentDirection = direction;
        }
    }

    private eat(): void {
        this.snake.eat();
        ++this._points;
    }

    private handleObstacleCreation(): void {
        if (this.points === 10) {
            this._obstacles.push({
                position: {
                    x: 0,
                    y: this.height / 3
                },
                length: 5
            });
            this._obstacles.push({
                position: {
                    x: this.width - 1,
                    y: this.height / 3 * 2
                },
                length: 5
            });
        }
    }

    private checkBorderCollision(): void {
        if (this.isNotOnTheField()) {
            throw Error('border crossed');
        } else {
            this.gameSubject.next({
                payload: {
                    direction: this.currentDirection
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

    private calculateNewFoodField(): void {
        const randomX = Math.round(Math.random() * (this.width - 1));
        const randomY = Math.round(Math.random() * (this.height - 1));

        this.field = {
            position: {
                x: randomX,
                y: randomY
            }
        };
    }

    private isEqualPosition(pos1: Position, pos2: Position): boolean {
        return pos1.x === pos2.x
            && pos1.y === pos2.y;
    }

    public get snake(): Snake {
        return this._snake;
    }

    public get foodField(): FoodField {
        return this.field;
    }

    public get obstacles(): Array<Obstacle> {
        return this._obstacles;
    }

    public get points(): number {
        return this._points;
    }
}
