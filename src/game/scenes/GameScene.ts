import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import Goal from "../objects/Goal";
import Puck from "../objects/Puck";
import { themes, type Theme } from "../../lib/theme";

export class GameScene extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    theme: Theme;
    // Game objects
    puck: Puck;
    goal: Goal;

    constructor() {
        super("GameScene");
        let randomTheme = Math.floor(Math.random() * themes.length);
        this.theme = themes[randomTheme];
    }

    create() {
        this.matter.world.setBounds();
        this.matter.world.disableGravity();
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(this.theme.background);

        this.puck = new Puck(this, 400, 600, this.theme);
        this.goal = new Goal(this, 1000, 400, this.theme);

        EventBus.emit("game-ready", this);
    }

    update() {
        this.puck.update();
    }
}

