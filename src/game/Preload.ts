import { Scene } from "phaser";

export class Preload extends Scene {
    constructor() {
        super("Preload");
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("puck", "puck.svg");
        this.load.image("puck-center", "puck-center.svg");
        this.load.image("puckHandle", "puck-handle.svg");
        this.load.image("goal", "goal.svg");
        this.load.image("obstacle", "obstacle.svg");
    }

    create() {
        this.scene.start("GameScene");
    }
}

