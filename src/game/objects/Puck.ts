import Phaser from 'phaser';

export class Puck extends Phaser.GameObjects.Graphics {
    constructor(scene: Phaser.Scene, options: Phaser.Types.GameObjects.Graphics.Options) {
      super(scene, options);
      // ...
      scene.add.existing(this);
    }
    // ...
  
    // preUpdate(time, delta) {}
  }
  