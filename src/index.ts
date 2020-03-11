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

const game = new Game(300, 400);

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

game.observeGame()
    .subscribe(() => {
        ctx.clearRect(2, 2, 297, 397);
        ctx.fillRect(game.foodField.position.x, game.foodField.position.y, 4, 4);
        let node = game.snake.head;
        while (node) {
            ctx.fillRect(node.position.x, node.position.y, 4, 4);
            node = node.next;
        }
    });

ctx.strokeRect(1, 1, 299, 399);

game.start();
