import * as PIXI from 'pixi.js';
import * as TWEEN from '@tweenjs/tween.js';
import { Tween } from '@tweenjs/tween.js';


interface ShipPosition {
    x: number;
    y: number;
}

interface Duration {
    fast: number;
    middle: number;
    slow: number;
}

export enum ShipChoices{
    empty = 'empty',
    full = 'full'
}
type ShipType = ShipChoices.empty | ShipChoices.full;

export class Ship {
    static width: number = 75;
    static height: number = 30;
    static transitionDuration: Duration = {
        slow: 5000,
        middle: 3000,
        fast: 1000,
    };

    private app: PIXI.Application;
    private readonly ship: PIXI.Graphics;
    private readonly color: string = '#6cf50a';
    private readonly type: ShipType;

    private isEmpty: boolean = false;

    constructor(
        app: PIXI.Application,
        x: number = 0,
        y: number = 0,
        type: ShipType = ShipChoices.empty,
        color: string = '#6cf50a'
    ) {
        this.app = app;
        this.type = type;
        this.color = color;

        this.ship = new PIXI.Graphics();
        this.ship.pivot.set(0, Ship.height / 2);
        this.ship.x = x;
        this.ship.y = y;

        if (this.type === ShipChoices.empty) {
            this.setEmpty();
        } else {
            this.setFull();
        }

        this.app.stage.addChild(this.ship);
    }

    createTween(
        targetPosition: ShipPosition,
        duration: number = Ship.transitionDuration.slow
    ): Tween<PIXI.ObservablePoint> {
        return new Tween(this.ship.position)
            .to({ x: targetPosition.x, y: targetPosition.y }, duration)
            .easing(TWEEN.Easing.Linear.None);
    }

    setFull(): void {
        this.isEmpty = false;
        this.renderFullShip();
        
    }
    private renderFullShip(): void {
        if (!this.ship.destroyed) {
            this.ship.clear();
            this.ship.rect(0, 0, Ship.width, Ship.height);
            this.ship.fill(this.color);
        }
    }

    setEmpty(): void {
        this.isEmpty = true;
        this.renderEmptyShip();
    }

    private renderEmptyShip(widthLine: number = 4): void {
        if (!this.ship.destroyed) {
            this.ship.clear();
            this.ship.rect(0, 0, Ship.width - Math.round(widthLine/2), Ship.height - Math.round(widthLine/2));
            this.ship.stroke({width: widthLine, color: this.color});
        }
    }
    get empty(): boolean {
        return this.isEmpty;
    }

    remove(): void {
        this.app.stage.removeChild(this.ship);
        this.ship.destroy({ children: true, texture: true });
    }
}

