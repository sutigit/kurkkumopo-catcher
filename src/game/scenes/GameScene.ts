import { EventBus } from "../EventBus";
import { Scene } from "phaser";
// import Goal from '../objects/Goal';

import Puck from "../objects/Puck";

// Game objects

// const PRIMARY = 0x2D336B;
// const SECONDARY = 0x7886C7;
// const TERTIARY = 0xA9B5DF;
const BACKGROUND = 0xfff2f2;

const START_POINT = { x: 400, y: 400 };

export class GameScene extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;

    // Game objects
    // goal: Phaser.Physics.Matter.Image;
    // obstacle: Phaser.Physics.Matter.Image;
    puck: Puck;

    constructor() {
        super("GameScene");
    }

    create() {
        this.matter.world.setBounds();
        this.matter.world.disableGravity();
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(BACKGROUND);

        this.puck = new Puck(this, START_POINT.x, START_POINT.y);

        // Goal
        // this.goal = this.matter.add.image(1400, 200, "goal");
        // this.goal.setCircle(28);
        // this.goal.setStatic(true);
        // this.goal.setSensor(true);

        EventBus.emit("game-ready", this);
    }

    update() {
        this.puck.update();
    }
}

