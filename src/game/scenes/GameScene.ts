import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import Goal from "../objects/Goal";
import Puck from "../objects/Puck";
import { themes, type Theme } from "../../lib/theme";

export class GameScene extends Scene {
    theme: Theme;

    // Cameras
    maincam: Phaser.Cameras.Scene2D.Camera;
    minimap: Phaser.Cameras.Scene2D.Camera;

    // World
    worldSize: { width: number; height: number };

    // Game objects
    puck: Puck;
    puckPosition: Phaser.Math.Vector2;

    goal: Goal;
    goalPosition: Phaser.Math.Vector2;

    constructor() {
        super("GameScene");
        // let randomTheme = Math.floor(Math.random() * themes.length);
        this.theme = themes[0];

        this.worldSize = { width: 4000, height: 4000 };
    }

    create() {
        // World physics
        this.matter.world.setBounds(
            0,
            0,
            this.worldSize.width,
            this.worldSize.height
        );
        this.matter.world.disableGravity();

        // Camera
        this.cameras.main
            .setBounds(0, 0, this.worldSize.width, this.worldSize.height)
            .setName("Main Camera");
        this.maincam = this.cameras.main;
        this.maincam.setZoom(1);
        this.maincam.setBackgroundColor(this.theme.background);

        // Minimap
        this.minimap = this.cameras
            .add(window.innerWidth - 300, window.innerHeight - 300, 250, 250)
            .setBounds(0, 0, this.worldSize.width, this.worldSize.height)
            .setZoom(0.1)
            .setScroll(this.worldSize.width / 2, this.worldSize.height / 2)
            .setRoundPixels(true)
            .setBackgroundColor("#dddddd") // TODO: borders would be better
            .setName("Minimap Camera");

        this.puck = new Puck(
            this,
            this.worldSize.width / 2,
            this.worldSize.height / 2,
            this.theme
        );
        this.goal = new Goal(
            this,
            this.worldSize.width / 2 + 400,
            this.worldSize.height / 2 - 200,
            this.theme
        );

        this.maincam.startFollow(this.puck.gameObject(), true, 0.1, 0.1);

        EventBus.emit("game-ready", this);
    }

    update() {
        this.puckPosition = this.puck.main();
        this.goalPosition = this.goal.main();
    }
}

