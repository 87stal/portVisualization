import * as PIXI from 'pixi.js';

interface GatePosition{
    x: number;
    y: number;
}

export class Gate {
    private app: PIXI.Application;
    private topPos: GatePosition;
    private bottomPos: GatePosition;
    private open: boolean = true;


    constructor(app: PIXI.Application, topPos: GatePosition, bottomPos: GatePosition) {
        this.app = app;
        this.topPos = topPos;
        this.bottomPos = bottomPos;

        const widthLine = 4;

        let topPart = new PIXI.Graphics();
        this.app.stage.addChild(topPart);
        topPart.moveTo(this.topPos.x - widthLine, 0);
        topPart.lineTo(this.topPos.x - widthLine, topPos.y);
        topPart.stroke({ width: widthLine, color: 0xffd900 });
        
        let bottomPart = new PIXI.Graphics();
        this.app.stage.addChild(bottomPart);
        bottomPart.moveTo(this.bottomPos.x - widthLine, this.bottomPos.y);
        bottomPart.lineTo(this.bottomPos.x - widthLine, this.bottomPos.y + topPart.height);
        bottomPart.stroke({ width: widthLine, color: 0xffd900 });
    }

    get topPosition(): GatePosition {
        return this.topPos;
    }

    get bottomPosition(): GatePosition {
        return this.bottomPos;
    }

    get isOpen(): boolean {
        return this.open;
    }

    set isOpen(value: boolean) {
        this.open = value;
    }
}