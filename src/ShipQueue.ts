import * as PIXI from 'pixi.js';
import { Ship } from './Ship';

interface ShipPosition{
    x: number;
    y:number;
}

export class Queue {
    private app: PIXI.Application;
    private queueBox: PIXI.Graphics;
    private shipsInQueue: Ship[];

    constructor(app: PIXI.Application, x: number = 0, y: number = 0) {
        this.app = app;
        this.queueBox = new PIXI.Graphics();
        this.queueBox.x = x;
        this.queueBox.y = y;
        this.app.stage.addChild(this.queueBox);
        this.shipsInQueue = [];
    }

    addShip(ship: Ship): void {
        this.shipsInQueue.push(ship);
    }

    freePosition(ship: Ship): ShipPosition {
        return {
            x: this.queueBox.x + this.shipsInQueue.indexOf(ship) * (Ship.width + 10),
            y: this.queueBox.y
        }
    }


    get ships(): Ship[] {
        return this.shipsInQueue;
    }


    get firstShip(): Ship {
        return this.shipsInQueue[0];
    }

    removeFirstShip(): void {
        this.shipsInQueue.shift();
    }

    get isEmpty(): boolean {
        return this.shipsInQueue.length === 0;
    }
}