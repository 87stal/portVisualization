import * as PIXI from 'pixi.js';
import { Game } from './Game';
import * as TWEEN from '@tweenjs/tween.js';

const appWidth: number = 1200;
const appHeight: number = 600;

// Create a new application
(async () => {

    // Create a new application
    const app = new PIXI.Application();
    
    // Initialize the application
    await app.init({ background: '#0000FF', width: appWidth, height: appHeight });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas); 

    new Game(app, appWidth, appHeight);

    setInterval(() => {
        TWEEN.update();
    }, 20);

})()
   