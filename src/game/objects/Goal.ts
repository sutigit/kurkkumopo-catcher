import { Physics } from "phaser";
import { Theme } from "../../lib/theme";

export default class Goal {
    theme: Theme;
    goal: Physics.Matter.Image;
    image: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number, theme: Theme) {
        this.theme = theme;

        const goalGraphics = scene.add.graphics();
        goalGraphics.fillStyle(theme.tertiary);
        goalGraphics.fillCircle(100, 100, 100);
        goalGraphics.generateTexture("goalGraphics", 200, 200);
        goalGraphics.destroy(); // Remove the graphics after converting it to a texture
        scene.add.image(x, y, "goalGraphics");

        this.goal = scene.matter.add.image(x, y, "toskaMopo");
        this.goal.setScale(0.35);
        this.goal.setCircle(100);
        this.goal.setStatic(true);
        this.goal.setSensor(true);
    }

    public main(): Phaser.Math.Vector2 {
        // rotate goal
        this.goal.setAngle(this.goal.angle - 2);

        // return center of the goal
        return this.goal.getCenter();
    }
}

