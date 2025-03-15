import { AUTO, Game } from "phaser";
import { GameScene } from "./scenes/GameScene";

const WINDOW_WIDTH = window.innerWidth;
const WINDOW_HEIGHT = window.innerHeight;

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    parent: "game-container",
    backgroundColor: "#242424",
    physics: {
        default: "matter",
        matter: {
            debug: false,
            gravity: {
                y: 0,
                x: 0,
            },
            enableSleeping: true,
        },
    },
    // I guess this is sort of the activation order of the scenes
    scene: [GameScene],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;

