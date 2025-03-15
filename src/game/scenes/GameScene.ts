// import { EventBus } from "../EventBus";
import { Scene } from "phaser";
// import Goal from '../objects/Goal';

// Game objects

// const PRIMARY = 0x2D336B;
// const SECONDARY = 0x7886C7;
// const TERTIARY = 0xA9B5DF;
const BACKGROUND = 0xfff2f2;

const START_POINT = { x: 400, y: 600 };

export class GameScene extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    // background: Phaser.GameObjects.Image;
    // gameText: Phaser.GameObjects.Text;
    // graphics: Phaser.GameObjects.Graphics;

    // Game objects
    puck: Phaser.Physics.Matter.Image;
    goal: Phaser.Physics.Matter.Image;
    sling: Phaser.Physics.Matter.Image;
    obstacle: Phaser.Physics.Matter.Image;

    // Positions
    pointerPos: Phaser.Math.Vector2;

    // States
    isDragging: boolean = false;
    isShooting: boolean = false;
    canShoot: boolean = false;

    constructor() {
        super("GameShootPuck");
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("puck", "puck.svg");
        this.load.image("puck-center", "puck-center.svg");
        this.load.image("sling", "sling.svg");
        this.load.image("goal", "goal.svg");
        this.load.image("obstacle", "obstacle.svg");
    }

    create() {
        this.matter.world.setBounds();
        this.matter.world.disableGravity();
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(BACKGROUND);

        // Puck
        this.puck = this.matter.add.image(START_POINT.x, START_POINT.y, "puck");
        this.puck.setCircle(25);
        this.puck.setBounce(0.9);

        this.sling = this.matter.add.image(
            START_POINT.x,
            START_POINT.y,
            "sling"
        );
        this.sling.setCircle(7);
        this.sling.setSensor(true);

        // Goal
        this.goal = this.matter.add.image(1400, 200, "goal");
        this.goal.setCircle(28);
        this.goal.setStatic(true);
        this.goal.setSensor(true);

        // Controls
        this.pointerPos = new Phaser.Math.Vector2(0, 0);

        this.input.on("pointerdown", (pointer: any) => {
            this.isDragging = true;
            this.pointerPos.set(pointer.x, pointer.y);
        });

        this.input.on("pointerup", (pointer: any) => {
            this.isDragging = false;
            this.canShoot = true;
            this.pointerPos.set(pointer.x, pointer.y);
        });

        this.input.on("pointermove", (pointer: any) => {
            if (this.isDragging) {
                this.pointerPos.set(pointer.x, pointer.y);
            }
        });

        // EventBus.emit("game-ready", this);
    }

    update() {
        if (this.sling.body) {
            if (this.isShooting) {
                const center = new Phaser.Math.Vector2(
                    START_POINT.x,
                    START_POINT.y
                );
                const directionX = center.x - this.sling.x;
                const directionY = center.y - this.sling.y;
                const distance = Math.sqrt(
                    directionX * directionX + directionY * directionY
                );
                if (distance < 10) {
                    this.sling.setVelocity(0, 0);
                    this.sling.setPosition(center.x, center.y);
                    return;
                }
                const normzDirection = {
                    x: directionX / distance,
                    y: directionY / distance,
                };
                const forceMagnitude = 0.00005 * Math.min(distance, 10); // Adjust the force magnitude as needed
                const force = new Phaser.Math.Vector2(
                    normzDirection.x * forceMagnitude,
                    normzDirection.y * forceMagnitude
                );
                this.sling.applyForce(force);
            } else if (!this.isDragging) {
                this.sling.setVelocity(0, 0);
            } else if (this.isDragging) {
                const directionX = this.pointerPos.x - this.sling.x;
                const directionY = this.pointerPos.y - this.sling.y;
                const distance = Math.sqrt(
                    directionX * directionX + directionY * directionY
                );
                const normzDirection = {
                    x: directionX / distance,
                    y: directionY / distance,
                };
                const forceMagnitude = 0.00005 * distance; // Adjust the force magnitude as needed
                const force = new Phaser.Math.Vector2(
                    normzDirection.x * forceMagnitude,
                    normzDirection.y * forceMagnitude
                );
                this.sling.applyForce(force);
                // Apply damping to reduce the velocity as the puck gets closer to the pointer
                const damping = 0.1; // Adjust the damping factor as needed
                this.sling.setVelocity(
                    this.sling.body.velocity.x * damping,
                    this.sling.body.velocity.y * damping
                );
            }
        }
    }
}

