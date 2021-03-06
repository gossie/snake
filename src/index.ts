import { Direction } from './direction';
import Event from './event';
import Game from './game';
import { LineObstacle } from './obstacle';

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

let currentDirection = Direction.UP;

let startTouchX: number;
let startTouchY: number;
canvas.addEventListener('touchstart', (event: TouchEvent) => {
    startTouchX = event.changedTouches['0'].clientX;
    startTouchY = event.changedTouches['0'].clientY;
}, {passive: false});

canvas.addEventListener('touchmove', (event: TouchEvent) => event.preventDefault());

canvas.addEventListener('touchend', (event: TouchEvent) => {
    const endTouchX = event.changedTouches['0'].clientX;
    const endTouchY = event.changedTouches['0'].clientY;

    if (currentDirection === Direction.UP || currentDirection === Direction.DOWN) {
        if (startTouchX > endTouchX) {
            game.setDirection(Direction.LEFT);
        } else {
            game.setDirection(Direction.RIGHT);
        }
    } else {
        if (startTouchY > endTouchY) {
            game.setDirection(Direction.UP);
        } else {
            game.setDirection(Direction.DOWN);
        }
    }
}, {passive: false});

const startButton = document.getElementById('start-button');
let gameSubscription;
startButton.addEventListener('click', () => {
    if (gameSubscription) {
        gameSubscription.unsubscribe();
    }

    gameSubscription = game.observeGame()
        .subscribe((event: Event) => {
            if (event.msg) {
                gameSubscription.unsubscribe();
                alert(event.msg);
            } else {
                currentDirection = event.payload.direction;
                document.getElementById('points').textContent = `${event.payload.points}`;
                ctx.clearRect(5, 5, 290, 390);
                ctx.fillStyle = '#9DCC06';
                ctx.fillRect(5, 5, 290, 390);
                ctx.fillStyle = '#000000';
                ctx.fillRect(5 + event.payload.foodField.position.x * 5, 5 + event.payload.foodField.position.y * 5, 5, 5);
                let node = event.payload.snake.head;
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(8 + node.position.x * 5, 8 + node.position.y * 5, 4, 0, 2 * Math.PI);
                ctx.fill();
                node = node.next;
                while (node) {
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(5 + node.position.x * 5, 5 + node.position.y * 5, 5, 5);
                    node = node.next;
                }

                event.payload.obstacles.forEach((obstacle: LineObstacle) => {
                    ctx.fillStyle = obstacle.solid ? '#000000' : '#777777';
                    ctx.fillRect(5 + obstacle.position.x * 5, 5 + obstacle.position.y * 5, 5 * obstacle.length, 5);
                });
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

ctx.fillStyle = '#9DCC06';
ctx.fillRect(5, 5, 290, 390);
