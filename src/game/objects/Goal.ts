import { Physics } from 'phaser';

export class Goal extends Physics.Matter.Image {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene.matter.world, x, y, texture);
        this.setCircle(28);
        this.setStatic(true);
        this.setSensor(true);
    }
}