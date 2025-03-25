import { Scene } from "phaser";

export class Preload extends Scene {
    constructor() {
        super("Preload");
    }

    preload() {
        this.load.setPath("assets");
        // this.load.image("example", "example.svg");

        this.load.image("toskaMopo", "toskaMopo.png");
        this.load.audio("bong", "sounds/bong.wav");
        this.load.audio("music", "sounds/733382__clacksberg__cosmic-ambient-music.mp3");
    }

    create() {
        this.scene.start("GameScene");
    }
}

