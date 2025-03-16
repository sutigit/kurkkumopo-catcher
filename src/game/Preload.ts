import { Scene } from "phaser";

export class Preload extends Scene {
    constructor() {
        super("Preload");
    }

    preload() {
        this.load.setPath("assets");
        // this.load.image("example", "example.svg");
    }

    create() {
        this.scene.start("GameScene");
    }
}

