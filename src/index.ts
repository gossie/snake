import { Direction } from './direction';
import Game from './game';

const canvas: HTMLCanvasElement = document.createElement('canvas');
canvas.width = 300;
canvas.height = 400;

canvas.style.cssText = 'image-rendering: optimizeSpeed;' + // FireFox < 6.0
    'image-rendering: -moz-crisp-edges;' + // FireFox
    'image-rendering: -o-crisp-edges;' +  // Opera
    'image-rendering: -webkit-crisp-edges;' + // Chrome
    'image-rendering: crisp-edges;' + // Chrome
    'image-rendering: -webkit-optimize-contrast;' + // Safari
    'image-rendering: pixelated; ' + // Future browsers
    '-ms-interpolation-mode: nearest-neighbor;'; // IE

document.getElementById('canvas').appendChild(canvas);

const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

const game = new Game(58, 78);

canvas.addEventListener('touchend', (event: TouchEvent) => {
    const touchX: number = event.changedTouches['0'].pageX;
    const touchY: number = event.changedTouches['0'].pageY;

    const snakeX = game.snake.head.position.x * 5;
    const snakeY = game.snake.head.position.y * 5;

    console.debug('touchX', touchX);
    console.debug('touchY', touchY);
    console.debug('snakeX', snakeX);
    console.debug('snakeY', snakeY);

    if (Math.abs(touchX - snakeX) > Math.abs(touchY - snakeY)) {
        if (touchX < snakeX) {
            game.setDirection(Direction.LEFT);
        } else {
            game.setDirection(Direction.RIGHT);
        }
    } else {
        if (touchY < snakeY) {
            game.setDirection(Direction.UP);
        } else {
            game.setDirection(Direction.DOWN);
        }
    }
});

const startButton = document.getElementById('start-button');
startButton.addEventListener('click', () => {
    const gameSubscription = game.observeGame()
        .subscribe((msg: string) => {
            if (msg) {
                gameSubscription.unsubscribe();
                alert(msg);
            } else {
                document.getElementById('points').textContent = `${game.points}`;
                ctx.clearRect(5, 5, 290, 390);
                ctx.fillRect(5 + game.foodField.position.x * 5, 5 + game.foodField.position.y * 5, 5, 5);
                let node = game.snake.head;
                while (node) {
                    ctx.fillRect(5 + node.position.x * 5, 5 + node.position.y * 5, 5, 5);
                    node = node.next;
                }
            }
        });

    game.start();
});

window.addEventListener('keydown', (e) => {
    switch (e.keyCode) {
        case 37:
            game.setDirection(Direction.LEFT);
            break;
        case 38:
            game.setDirection(Direction.UP);
            break;
        case 39:
            game.setDirection(Direction.RIGHT);
            break;
        case 40:
            game.setDirection(Direction.DOWN);
            break;
    }
}, false);

ctx.strokeRect(0, 0, 300, 400);
ctx.strokeRect(1, 1, 298, 398);
ctx.strokeRect(2, 2, 296, 396);
ctx.strokeRect(3, 3, 294, 394);
ctx.strokeRect(4, 4, 292, 392);
