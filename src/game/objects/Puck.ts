import Phaser from "phaser";
import { Theme } from "../../lib/theme";

enum Handle {
    CENTER = 0,
    DRAWING = 1,
    RELEASE = 2,
    START_SHOOT = 3,
    SHOOTING = 4,
}

export default class Puck {
    scene: Phaser.Scene;
    theme: Theme;
    puck: Phaser.Physics.Matter.Image;
    handle: Phaser.Physics.Matter.Image;
    center: Phaser.GameObjects.Image;

    slingGraphicsA: Phaser.GameObjects.Graphics;
    slingPolygonA: Phaser.Geom.Polygon;
    slingGraphicsB: Phaser.GameObjects.Graphics;
    slingPolygonB: Phaser.Geom.Polygon;

    arrowGraphics: Phaser.GameObjects.Graphics;
    arrowPolygon: Phaser.Geom.Polygon;

    pointerPos: Phaser.Math.Vector2;

    isHandleReset: boolean;
    isHandleDrawing: boolean;
    isHandleInMotion: boolean;
    canHandleShoot: boolean;

    isPuckInMotion: boolean;

    x: number;
    y: number;
    puckRadius: number;
    handleRadius: number;

    bounce: number;
    force: number;

    constructor(
        scene: Phaser.Scene,
        start_x: number,
        start_y: number,
        theme: Theme,
        force: number = 10,
        bounce: number = 0.9
    ) {
        this.scene = scene;
        this.theme = theme;
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

        // Main objects ------------------------------------------------
        const puckGraphics = scene.add.graphics();
        puckGraphics.fillStyle(theme.secondary);
        puckGraphics.fillCircle(25, 25, 25);
        puckGraphics.generateTexture("puckGraphics", 50, 50);
        puckGraphics.destroy(); // Remove the graphics after converting it to a texture
        this.puck = scene.matter.add.image(start_x, start_y, "puckGraphics");
        this.puck.setDepth(1);
        this.puck.setCircle(25);
        this.puck.setBounce(bounce);

        const centerGraphics = scene.add.graphics();
        centerGraphics.fillStyle(theme.tertiary);
        centerGraphics.fillCircle(7, 7, 7);
        centerGraphics.generateTexture("centerGraphics", 14, 14);
        centerGraphics.destroy(); // Remove the graphics after converting it to a texture
        this.center = scene.add
            .image(this.puck.x, this.puck.y, "centerGraphics")
            .setDepth(2);

        const handleGraphics = scene.add.graphics();
        handleGraphics.fillStyle(theme.primary);
        handleGraphics.fillCircle(7, 7, 7);
        handleGraphics.generateTexture("handleGraphics", 14, 14);
        handleGraphics.destroy(); // Remove the graphics after converting it to a texture
        this.handle = scene.matter.add.image(
            start_x,
            start_y,
            "handleGraphics"
        );
        this.handle.setDepth(3);
        this.handle.setCircle(7);
        this.handle.setSensor(true);

        // Geometrics --------------------------------------------------
        this.puckRadius = this.puck.getBounds().width / 2;
        this.handleRadius = this.handle.getBounds().width / 2;

        // Control events ----------------------------------------------
        scene.input.on("pointerdown", (pointer: any) => {
            this.isHandleDrawing = true;
            this.pointerPos.set(pointer.x, pointer.y);
        });
        scene.input.on("pointerup", (pointer: any) => {
            this.isHandleDrawing = false;
            this.pointerPos.set(pointer.x, pointer.y);
        });
        scene.input.on("pointermove", (pointer: any) => {
            if (this.isHandleDrawing) {
                this.pointerPos.set(pointer.x, pointer.y);
            }
        });

        // Graphics objects --------------------------------------------
        const points = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        const slingStyle = { fillStyle: { color: theme.tertiary } };
        this.slingPolygonA = new Phaser.Geom.Polygon(points);
        this.slingGraphicsA = this.scene.add.graphics(slingStyle);
        this.slingGraphicsA.fillPoints(this.slingPolygonA.points, true);
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

    renderSling() {
        const { x: puckX, y: puckY } = this.puck.getCenter();
        const { x: handleX, y: handleY } = this.handle.getCenter();
        const r = Phaser.Math.Distance.Between(puckX, puckY, handleX, handleY);
        const s = this.puckRadius;
        const u = this.handleRadius;
        const alpha = Math.atan((s - u) / r);
        const beta = Math.PI - alpha;

        const a1 = (s - u) * Math.sin(alpha) + puckX;
        const a2 = (s - u) * Math.cos(alpha) + puckY;
        const b1 = (s - u) * Math.sin(beta) + handleX;
        const b2 = (s - u) * Math.cos(beta) + handleY;

        this.slingPolygonA.setTo([
            { x: this.puck.x, y: this.puck.y },
            { x: this.handle.x, y: this.handle.y },
            { x: b1, y: b2 },
            { x: a1, y: a2 },
        ]);

        this.slingGraphicsA.clear();
        this.slingGraphicsA.fillPoints(this.slingPolygonA.points, true);
    }

    renderArrow() {}

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

        // Constant rendering things
        this.renderSling();
        this.center.setPosition(this.puck.x, this.puck.y);
    }
}

