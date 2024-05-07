import * as PIXI from 'pixi.js';
import { Gate } from './Gate';
import { Dock } from './Dock';
import { Queue } from './ShipQueue';
import { Ship, ShipChoices } from './Ship';
import { Tween } from '@tweenjs/tween.js';

export class Game {
    static  gate: Gate;
    private app: PIXI.Application;
    static createShipFrequency: number = 8000; 
    static stayInPortTime: number = 5000;
    static dockWidth: number = 45;
    static dockHeight: number = 120;
    private appWidth: number;
    static emptyShipsQueue: Queue;
    static fullShipsQueue: Queue;
    private width: number;
    private height: number;
    private dockAmount: number;
    private dockGap: number;
    private docks: Dock[];
    private delayPromise(ms: number) {
      new Promise(resolve => setTimeout(resolve, ms))
    }


    constructor (app: PIXI.Application, appWidth: number, appHeight: number) {
      this.app = app;
      this.appWidth = appWidth;
      this.width = appWidth/3;
      this.height = appHeight;
      this.docks = [];
      this.dockAmount = 4;
      this.dockGap = 20;

      for (let i: number = 0; i < this.dockAmount; i++) {
        const dockX: number = 10;
        const dockY: number = (Game.dockHeight + this.dockGap) * i + 35;
        const dock: Dock = new Dock(this.app, dockX, dockY, Game.dockWidth, Game.dockHeight);
        dock.setEmpty();

        this.docks.push(dock);
      }

      this.createGate();
      this.createQueueLines();
      this.shipMoving();

      setInterval(() => {
          this.shipMoving();
      }, Game.createShipFrequency);

    } 

    createGate() {
      Game.gate = new Gate(
        this.app,
        { x: this.width, y: Math.round(this.height / 3) },
        { x: this.width, y: Math.round(this.height - this.height / 3) }
      );
    }

    createQueueLines() {
      Game.emptyShipsQueue = new Queue(this.app, Game.gate.topPosition.x + 20, Game.gate.topPosition.y);
      Game.fullShipsQueue = new Queue(this.app, Game.gate.bottomPosition.x + 20, Game.gate.bottomPosition.y);
    }

    private shipMoving(): void {
      let newShip: Ship;
      let fullColor: string = '#f50a0a';
      let emptyColor: string = '#6cf50a';
      if (Math.random() < 0.499) {
         newShip = new Ship(this.app, this.appWidth, Game.gate.topPosition.y, ShipChoices.empty, emptyColor);
      } else {
         newShip = new Ship(this.app, this.appWidth, Game.gate.topPosition.y, ShipChoices.full, fullColor);
      }
      
      this.beginShipMotion(newShip);
  }

    private beginShipMotion (ship: Ship, fromQueue: boolean = false) {
    let openGateInterval: NodeJS.Timeout;

    const firstTween: Tween<PIXI.ObservablePoint> = this.moveToGate(ship, 0, fromQueue ? Ship.transitionDuration.fast : Ship.transitionDuration.slow)
        .onStart(function() {
          openGateInterval = setInterval(() => {
                if (Game.gate.isOpen && firstTween.isPaused()) {
                    firstTween.resume();
                }
            }, 40);
        })
        .onUpdate(function (object: PIXI.ObservablePoint, elapsed: number) {
            if (!Game.gate.isOpen && elapsed > 0.5 && firstTween.isPlaying()) {
                firstTween.pause();
            }
        })
        .onComplete(() => {
            clearInterval(openGateInterval);
            const queue: Queue = ship.empty ? Game.emptyShipsQueue : Game.fullShipsQueue;

            const dockIndex: number = this.findFreeDock(ship);
            if (dockIndex < 0) {
                queue.addShip(ship);
                this.moveToQueue(ship, queue);
            } else {
                this.moveToDock(ship, dockIndex)
                    .onStart(() => {
                        this.docks[dockIndex].open = false;
                    })
                    .onComplete(async () => {
                        this.moveToGate(ship, Game.stayInPortTime, Ship.transitionDuration.middle)
                            .onStart(() => {
                                this.docks[dockIndex].open = true;
                                const queue: Queue = ship.empty ? Game.emptyShipsQueue : Game.fullShipsQueue;
                                if (!queue.isEmpty) {
                                    const firstShip: Ship = queue.firstShip;
                                    const firstShipDockIndex: number = this.findFreeDock(firstShip);
                                    if(firstShipDockIndex > -1) {
                                        queue.removeFirstShip();
                                        queue.ships.forEach((shipInQueue: Ship) => {
                                            this.moveToQueue(shipInQueue, queue);
                                        });
                                        this.beginShipMotion(firstShip, true);
                                    }
                                }
                            })
                            .onUpdate((object: PIXI.ObservablePoint, elapsed: number) => {
                                if (elapsed > 0.5) {
                                  Game.gate.isOpen = false;
                                }
                            })
                            .onComplete(() => {
                                this.moveToViewportOut(ship)
                                    .onComplete(() => {
                                        this.removeShip(ship);
                                    });
                                    Game.gate.isOpen = true;
                            });

                        await this.delayPromise(Game.stayInPortTime / 2);

                        if (ship.empty) {
                            ship.setFull();
                            this.docks[dockIndex].setEmpty();
                        } else {
                            ship.setEmpty();
                            console.log(this.docks.length);
                            this.docks[dockIndex].setFull();
                        }
                    });
            }
        });
}

  private findFreeDock(ship: Ship): number {
    return this.docks.findIndex(
        (dock: Dock) => dock.open
            && (
                ship.empty ? !dock.empty : !ship.empty ? dock.empty : -1
            )
    );
}

private moveToGate(
    ship: Ship,
    delay: number,
    duration: number = Ship.transitionDuration.slow
): Tween<PIXI.ObservablePoint> {
    return ship.createTween(
        {
            x: Game.gate.topPosition.x,
            y: Game.gate.bottomPosition.y - Math.round((Game.gate.bottomPosition.y - Game.gate.topPosition.y) / 2)
        },
        duration
    ).delay(delay).start();
}

private moveToDock(ship: Ship, dockIndex: number): Tween<PIXI.ObservablePoint> {
    return ship.createTween(this.docks[dockIndex].dockPosition, Ship.transitionDuration.middle).start();
}

private moveToQueue(ship: Ship, queue: Queue): Tween<PIXI.ObservablePoint> {
    return ship.createTween(queue.freePosition(ship), Ship.transitionDuration.fast).start();
}


private moveToViewportOut(ship: Ship): Tween<PIXI.ObservablePoint> {
    return ship.createTween({ x: this.appWidth, y: Game.gate.bottomPosition.y }).start();
}

private removeShip(ship: Ship): void {
    if (ship) {
      ship.remove();
    } 
}
    
}
