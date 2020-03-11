import { interval, Observable, Subject, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { Direction } from './direction';
import FoodField from './food-field';
import Position from './position';
import Snake from './snake';

export default class Game {

    private _snake: Snake;
    private field: FoodField;
    private currentDirection: Direction = Direction.UP;
    private subscription: Subscription;
    private gameSubject = new Subject<void>();

    constructor(private width: number, private height: number) {}

    public start(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        this._snake = new Snake(Math.round(this.width / 2), Math.round(this.height / 2));

        this.calculateNewFoodField();

        this.subscription = interval(50)
            .pipe(
                tap(() => this.snake.move(this.currentDirection)),
                tap(() => this.gameSubject.next()),
                filter(() => this.isEqualPosition(this.field.position, this.snake.head.position))
            )
            .subscribe(() => {
                this.snake.eat();
                this.calculateNewFoodField();
                this.gameSubject.next();
            });
    }

    public observeGame(): Observable<void> {
        return this.gameSubject.asObservable();
    }

    public setDirection(direction: Direction): void {
        this.currentDirection = direction;
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
}
