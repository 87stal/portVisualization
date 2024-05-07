import * as PIXI from 'pixi.js';

export interface DockPosition{
    x: number;
    y: number;
}

export class Dock {
    private app: PIXI.Application;
    private dock: PIXI.Graphics;

    private color: number = 0xffffff;
    private width: number;
    private height: number;

    private _empty: boolean = false;
    private _open: boolean = true;

    
    constructor(app: PIXI.Application, x: number, y: number, width: number, height: number) {
        this.app = app;
        this.width = width;
        this.height = height;

        this.dock = new PIXI.Graphics();
        this.dock.x = x;
        this.dock.y = y;

        this.setEmpty();

        this.app.stage.addChild(this.dock);
    }

    get dockPosition(): DockPosition {
        return {
            x: this.dock.x + this.width,
            y: this.dock.y + this.height / 2
        }
    }

    setFull(): void {
        this._empty = false;
        this.createFullDock();
    }

    setEmpty(): void {
        this._empty = true;
        this.createEmptyDock();
    }

    get empty(): boolean {
        return this._empty;
    }

    get open(): boolean {
        return this._open;
    }

    set open( value: boolean ) {
        this._open = value;
    }

    private createFullDock(): void {
        this.dock.clear();
        this.dock.rect(0, 0, this.width,this.height);
        this.dock.fill({color: this.color});
    }

    private createEmptyDock(thickness: number = 4): void {
        this.dock.clear();
        this.dock.rect( Math.round(thickness / 2),
        Math.round(thickness / 2), this.width - thickness,
        this.height - thickness)
        .stroke({ width: thickness, color: 0xffffff })
        .fill({ color: this.color, alpha: 0 });
    }
}