import React, { useRef } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";

function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    const [isStarted, setIsStarted] = React.useState(false);

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
            {isStarted ? (
                <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            ) : (
                <button autoFocus onClick={() => setIsStarted(true)}>Start Game</button>
            )}
            
        </div>
    );
}

export default App;

