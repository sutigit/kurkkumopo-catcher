import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import Goal from "../objects/Goal";
import Puck from "../objects/Puck";

// const PRIMARY = 0x2D336B;
// const SECONDARY = 0x7886C7;
// const TERTIARY = 0xA9B5DF;
const BACKGROUND = 0xfff2f2;

export class GameScene extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;

    // Game objects
    puck: Puck;
    goal: Goal;

    constructor() {
        super("GameScene");
    }

    create() {
        this.matter.world.setBounds();
        this.matter.world.disableGravity();
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(BACKGROUND);

        this.puck = new Puck(this, 400, 600);
        this.goal = new Goal(this, 1000, 400);

        EventBus.emit("game-ready", this);
    }

    update() {
        this.puck.update();
    }
}

