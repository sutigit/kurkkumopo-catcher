import React, { useRef } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";

function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    // const changeScene = () => {

    //     if(phaserRef.current)
    //     {
    //         const scene = phaserRef.current.scene as MainMenu;

    //         if (scene)
    //         {
    //             scene.changeScene();
    //         }
    //     }
    // }

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {};

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
        </div>
    );
}

export default App;

