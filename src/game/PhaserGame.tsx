import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import StartGame from "./main";
import { EventBus } from "./EventBus";

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

