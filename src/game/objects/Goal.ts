import { Physics } from "phaser";
import { Theme } from "../../lib/theme";

export default class Goal {
    theme: Theme;
    goal: Physics.Matter.Image;

    constructor(scene: Phaser.Scene, x: number, y: number, theme: Theme) {
        this.theme = theme;

        const goalGraphics = scene.add.graphics();
        goalGraphics.fillStyle(theme.primary);
        goalGraphics.fillCircle(60, 60, 60);
        goalGraphics.generateTexture("goalGraphics", 120, 120);
        goalGraphics.destroy(); // Remove the graphics after converting it to a texture
        this.goal = scene.matter.add.image(x, y, "goalGraphics");
        this.goal.setCircle(60);
        this.goal.setStatic(true);
        this.goal.setSensor(true);
    }
}

