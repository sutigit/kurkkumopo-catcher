import Phaser from "phaser";

enum Handle {
    CENTER = 0,
    DRAWING = 1,
    RELEASE = 2,
    START_SHOOT = 3,
    SHOOTING = 4,
}

export default class Puck {
    scene: Phaser.Scene;
    puck: Phaser.Physics.Matter.Image;
    handle: Phaser.Physics.Matter.Image;

    pointerPos: Phaser.Math.Vector2;

    isHandleReset: boolean;
    isHandleDrawing: boolean;
    isHandleInMotion: boolean;
    canHandleShoot: boolean;

    isPuckInMotion: boolean;

    x: number;
    y: number;

    bounce: number;
    force: number;

    constructor(
        scene: Phaser.Scene,
        start_x: number,
        start_y: number,
        force: number = 10,
        bounce: number = 0.9
    ) {
        this.scene = scene;
        this.x = start_x;
        this.y = start_y;

        this.isPuckInMotion = false;

        this.isHandleReset = true;
        this.isHandleDrawing = false;
        this.isHandleInMotion = false;
        this.canHandleShoot = false;

        this.isPuckInMotion = false;

        this.bounce = bounce;
        this.force = force;
        this.pointerPos = new Phaser.Math.Vector2(0, 0);

        // Main objects
        this.puck = scene.matter.add.image(start_x, start_y, "puck");
        this.puck.setCircle(25);
        this.puck.setBounce(bounce);

        this.handle = scene.matter.add.image(start_x, start_y, "puckHandle");
        this.handle.setCircle(7);
        this.handle.setSensor(true);

        // Control events
        this.scene.input.on("pointerdown", (pointer: any) => {
            this.isHandleDrawing = true;
            this.pointerPos.set(pointer.x, pointer.y);
        });
        this.scene.input.on("pointerup", (pointer: any) => {
            this.isHandleDrawing = false;
            this.pointerPos.set(pointer.x, pointer.y);
        });
        this.scene.input.on("pointermove", (pointer: any) => {
            if (this.isHandleDrawing) {
                this.pointerPos.set(pointer.x, pointer.y);
            }
        });
    }

    worldToLocalPos(pos: Phaser.Math.Vector2): Phaser.Math.Vector2 {
        return this.puck.getWorldTransformMatrix().applyInverse(pos.x, pos.y);
    }

    resetHandle() {
        this.handle.setVelocity(0, 0);
        this.handle.setPosition(this.puck.x, this.puck.y);

        this.isHandleReset = true;
        this.isHandleDrawing = false;
        this.isHandleInMotion = false;
        this.canHandleShoot = false;
    }

    drawHandle() {
        this.isHandleReset = false;

        const directionX = this.pointerPos.x - this.handle.x;
        const directionY = this.pointerPos.y - this.handle.y;
        const distance = Math.sqrt(
            directionX * directionX + directionY * directionY
        );
        const normzDirection = {
            x: directionX / distance,
            y: directionY / distance,
        };
        const forceMagnitude = 0.00005 * distance; // Adjust the force magnitude as needed
        const force = new Phaser.Math.Vector2(
            normzDirection.x * forceMagnitude,
            normzDirection.y * forceMagnitude
        );
        this.handle.applyForce(force);
        // Apply damping to reduce the velocity as the puck gets closer to the pointer
        const damping = 0.1; // Adjust the damping factor as needed
        if (this.handle.body) {
            this.handle.setVelocity(
                this.handle.body.velocity.x * damping,
                this.handle.body.velocity.y * damping
            );
        }
    }

    readyShootHandle() {
        this.handle.setVelocity(0, 0);
        this.canHandleShoot = true;
    }

    startShootHandle() {
        this.isHandleInMotion = true;
        this.canHandleShoot = false;
    }

    shootHandle() {
        const center = new Phaser.Math.Vector2(this.puck.x, this.puck.y);
        const directionX = center.x - this.handle.x;
        const directionY = center.y - this.handle.y;
        const distance = Math.sqrt(
            directionX * directionX + directionY * directionY
        );
        const normzDirection = {
            x: directionX / distance,
            y: directionY / distance,
        };
        const forceMagnitude = 0.00005 * Math.min(distance, this.force); // Adjust the force magnitude as needed
        const forceVector = new Phaser.Math.Vector2(
            normzDirection.x * forceMagnitude,
            normzDirection.y * forceMagnitude
        );
        this.handle.applyForce(forceVector);
    }

    isCenterContact(): boolean {
        const handleLocalPos = this.worldToLocalPos(this.handle.getCenter());
        const pointerLocalPos = this.worldToLocalPos(this.pointerPos);

        const result =
            Math.sign(handleLocalPos.x) === -Math.sign(pointerLocalPos.x) &&
            Math.sign(handleLocalPos.y) === -Math.sign(pointerLocalPos.y)
                ? true
                : false;

        return result;
    }

    getState() {
        // When puck handle is at the center of the puck and not interacted with
        if (this.isHandleReset && !this.isHandleDrawing) return Handle.CENTER;
        // When player is drawing the puck handle
        else if (this.isHandleDrawing) return Handle.DRAWING;
        // 1 frame after player releases the puck handle
        else if (
            !this.isHandleReset &&
            !this.isHandleDrawing &&
            !this.canHandleShoot &&
            !this.isHandleInMotion
        )
            return Handle.RELEASE;
        // When the puck gets ready to travel
        else if (this.canHandleShoot) return Handle.START_SHOOT;
        // When the puck is in motion
        else if (this.isHandleInMotion) return Handle.SHOOTING;
    }

    update() {
        if (this.isPuckInMotion) {
            this.handle.setPosition(this.puck.x, this.puck.y);

            // Check if the puck has stopped moving
            const { x, y } = this.puck.getVelocity();
            if (Math.abs(x) < 0.01 && Math.abs(y) < 0.01) {
                this.isPuckInMotion = false;
            }
        } else {
            switch (this.getState()) {
                case Handle.CENTER:
                    this.resetHandle();
                    break;
                case Handle.DRAWING:
                    this.drawHandle();
                    break;
                case Handle.RELEASE:
                    this.readyShootHandle();
                    break;
                case Handle.START_SHOOT:
                    this.startShootHandle();
                    break;
                case Handle.SHOOTING:
                    this.shootHandle();

                    // Check if handle is in contact with the center of the puck again
                    if (this.isCenterContact()) {
                        const { x, y } = this.handle.getVelocity();
                        this.resetHandle();
                        const magicConstant = 0.006;

                        // Shoot the puck!
                        this.puck.applyForce(
                            new Phaser.Math.Vector2(
                                magicConstant * x,
                                magicConstant * y
                            )
                        );

                        this.isPuckInMotion = true;
                    }
                    break;

                default:
                    break;
            }
        }
    }
}

