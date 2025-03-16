import Phaser from "phaser";

enum HandleState {
    CENTER = 0,
    DRAWING = 1,
    RELEASE = 2,
    START_SHOOT = 3,
    SHOOTING = 4,
}

export default class Puck {
    puck: Phaser.Physics.Matter.Image;
    handle: Phaser.Physics.Matter.Image;

    isCenter: boolean;
    isDrawing: boolean;
    isShooting: boolean;
    canShoot: boolean;

    constructor(scene: Phaser.Scene, start_x: number, start_y: number) {
        this.isCenter = true;
        this.isDrawing = false;
        this.isShooting = false;
        this.canShoot = false;

        this.puck = scene.matter.add.image(start_x, start_y, "puck");
        this.puck.setCircle(25);
        this.puck.setBounce(0.9);

        this.handle = scene.matter.add.image(start_x, start_y, "puckHandle");
        this.handle.setCircle(7);
        this.handle.setSensor(true);
    }

    reset() {
        this.handle.setVelocity(0, 0);
        this.handle.setPosition(this.puck.x, this.puck.y);
        this.isCenter = true;
        this.isDrawing = false;
        this.canShoot = false;
        this.isShooting = false;
    }

    draw(pointerPos: Phaser.Math.Vector2) {
        this.isCenter = false;

        const directionX = pointerPos.x - this.handle.x;
        const directionY = pointerPos.y - this.handle.y;
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

    readyShoot() {
        this.handle.setVelocity(0, 0);
        this.canShoot = true;
    }

    startShoot() {
        this.isShooting = true;
        this.canShoot = false;
    }

    shoot() {
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
        const forceMagnitude = 0.00005 * Math.min(distance, 10); // Adjust the force magnitude as needed
        const force = new Phaser.Math.Vector2(
            normzDirection.x * forceMagnitude,
            normzDirection.y * forceMagnitude
        );
        this.handle.applyForce(force);
    }

    isCenterContact(pointerPos: Phaser.Math.Vector2): boolean {
        const handleLocalPos = this.worldToLocalPos(this.handle.getCenter());
        const pointerLocalPos = this.worldToLocalPos(pointerPos);

        const result =
            Math.sign(handleLocalPos.x) === -Math.sign(pointerLocalPos.x) &&
            Math.sign(handleLocalPos.y) === -Math.sign(pointerLocalPos.y)
                ? true
                : false;

        return result;
    }

    logStates() {
        console.log(
            `isCenter: ${this.isCenter}, isDrawing: ${this.isDrawing}, canShoot: ${this.canShoot}, isShooting: ${this.isShooting}`
        );
    }

    getHandleState() {
        // When puck handle is at the center of the puck
        if (this.isCenter && !this.isDrawing) return HandleState.CENTER;
        // When player is drawing the puck handle
        else if (this.isDrawing) return HandleState.DRAWING;
        // 1 frame after player releases the puck handle after drawing
        else if (
            !this.isCenter &&
            !this.isDrawing &&
            !this.canShoot &&
            !this.isShooting
        )
            return HandleState.RELEASE;
        // When the puck gets ready to travel
        else if (this.canShoot) return HandleState.START_SHOOT;
        // When the puck is in motion
        else if (this.isShooting) return HandleState.SHOOTING;
    }

    worldToLocalPos(pos: Phaser.Math.Vector2): Phaser.Math.Vector2 {
        return this.puck.getWorldTransformMatrix().applyInverse(pos.x, pos.y);
    }

    update(pointerPos: Phaser.Math.Vector2) {
        if (this.getHandleState() === HandleState.CENTER) {
            this.reset();
        } else if (this.getHandleState() === HandleState.DRAWING) {
            this.draw(pointerPos);
        } else if (this.getHandleState() === HandleState.RELEASE) {
            this.readyShoot();
        } else if (this.getHandleState() === HandleState.START_SHOOT) {
            this.startShoot();
        } else if (this.getHandleState() === HandleState.SHOOTING) {
            this.shoot();

            // Check if handle is in contact with the center of the puck again
            if (this.isCenterContact(pointerPos)) {
                this.reset();
            }
        }
    }
}

