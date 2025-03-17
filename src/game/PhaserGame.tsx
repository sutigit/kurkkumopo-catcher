import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { EventBus } from "./EventBus";
import { AUTO, Game } from "phaser";
import { GameScene } from "./scenes/GameScene";
import { Preload } from "./Preload";
import React from "react";

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
            runner: {
                isFixed: true,
            }
        },
    },
    scene: [Preload, GameScene],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};
export interface IRefPhaserGame {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

interface IProps {
    currentActiveScene?: (scene_instance: Phaser.Scene) => void;
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(
    function PhaserGame({ currentActiveScene }, ref) {
        const game = useRef<Phaser.Game | null>(null!);

        useLayoutEffect(() => {
            if (game.current === null) {
                game.current = StartGame("game-container");

                if (typeof ref === "function") {
                    ref({ game: game.current, scene: null });
                } else if (ref) {
                    ref.current = { game: game.current, scene: null };
                }
            }

            // Destroy the game when the component is unmounted
            return () => {
                if (game.current) {
                    game.current.destroy(true);
                    if (game.current !== null) {
                        game.current = null;
                    }
                }
            };
        }, [ref]);

        useEffect(() => {
            EventBus.on("game-ready", (scene: Phaser.Scene) => {
                if (
                    currentActiveScene &&
                    typeof currentActiveScene === "function"
                ) {
                    currentActiveScene(scene);
                }

                if (typeof ref === "function") {
                    ref({ game: game.current, scene });
                } else if (ref) {
                    ref.current = { game: game.current, scene };
                }
            });
            return () => {
                EventBus.removeListener("game-ready");
            };
        }, [currentActiveScene, ref]);

        return <div id="game-container"></div>;
    }
);

