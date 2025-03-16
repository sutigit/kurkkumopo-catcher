import { Physics } from "phaser";

export default class Goal {
    goal: Physics.Matter.Image;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.goal = scene.matter.add.image(x, y, "goal");
        this.goal.setCircle(28);
        this.goal.setStatic(true);
        this.goal.setSensor(true);
    }
}

