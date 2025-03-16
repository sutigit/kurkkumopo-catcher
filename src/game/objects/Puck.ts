import Phaser from "phaser";
import { Theme } from "../../lib/theme";

enum Handle {
    CENTER = 0,
    PULLING = 1,
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

    slingGraphics: Phaser.GameObjects.Graphics;
    slingPolygon: Phaser.Geom.Polygon;

    arrowGraphics: Phaser.GameObjects.Graphics;
    arrowPolygon: Phaser.Geom.Polygon;

    pointerPos: Phaser.Math.Vector2;

    isHandleReset: boolean;
    isHandlePulling: boolean;
    isHandleInMotion: boolean;
    canHandleShoot: boolean;

    isPuckInMotion: boolean;

    x: number;
    y: number;
    puckRadius: number;
    handleRadius: number;

    bounce: number;
    maxPullDistance: number;

    constructor(
        scene: Phaser.Scene,
        start_x: number,
        start_y: number,
        theme: Theme
    ) {
        // Init -----------------------------------------------
        this.scene = scene;
        this.theme = theme;
        this.x = start_x;
        this.y = start_y;

        // Puck states ---------------------------------------
        this.isPuckInMotion = false;
        this.isHandleReset = true;
        this.isHandlePulling = false;
        this.isHandleInMotion = false;
        this.canHandleShoot = false;

        // Physics properties --------------------------------
        this.bounce = 0.9;
        this.maxPullDistance = 160;

        // Main objects ------------------------------------------------
        const puckGraphics = scene.add.graphics();
        puckGraphics.fillStyle(theme.secondary);
        puckGraphics.fillCircle(25, 25, 25);
        puckGraphics.generateTexture("puckGraphics", 50, 50);
        puckGraphics.destroy(); // Remove the graphics after converting it to a texture
        this.puck = scene.matter.add.image(start_x, start_y, "puckGraphics");
        this.puck.setDepth(1);
        this.puck.setCircle(25);
        this.puck.setBounce(this.bounce);

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
        this.pointerPos = new Phaser.Math.Vector2(0, 0);

        // Control events ----------------------------------------------
        window.document.body.style.cursor = "grab";
        scene.input.on("pointerdown", (pointer: any) => {
            this.isHandlePulling = true;
            window.document.body.style.cursor = "grabbing";
            this.pointerPos.set(pointer.x, pointer.y);
        });
        scene.input.on("pointerup", (pointer: any) => {
            this.isHandlePulling = false;
            window.document.body.style.cursor = "grab";
            this.pointerPos.set(pointer.x, pointer.y);
        });
        scene.input.on("pointermove", (pointer: any) => {
            if (this.isHandlePulling) {
                window.document.body.style.cursor = "grabbing";
                this.pointerPos.set(pointer.x, pointer.y);
            }
        });

        // Graphics objects --------------------------------------------
        const initPoints = [0, 0, 0, 0, 0, 0, 0, 0];
        const slingStyle = { fillStyle: { color: theme.tertiary } };
        this.slingPolygon = new Phaser.Geom.Polygon(initPoints);
        this.slingGraphics = this.scene.add.graphics(slingStyle);
        this.slingGraphics.fillPoints(this.slingPolygon.points, false);
        this.slingGraphics.setDepth(0);

        const arrowStyle = { fillStyle: { color: theme.primary } };
        this.arrowPolygon = new Phaser.Geom.Polygon(initPoints);
        this.arrowGraphics = this.scene.add.graphics(arrowStyle);
        this.arrowGraphics.fillPoints(this.arrowPolygon.points, false);
        this.arrowGraphics.setDepth(10);
    }

    private worldToLocalPos(pos: Phaser.Math.Vector2): Phaser.Math.Vector2 {
        return this.puck.getWorldTransformMatrix().applyInverse(pos.x, pos.y);
    }

    private resetHandle() {
        this.handle.setVelocity(0, 0);
        this.handle.setPosition(this.puck.x, this.puck.y);

        this.isHandleReset = true;
        this.isHandlePulling = false;
        this.isHandleInMotion = false;
        this.canHandleShoot = false;
    }

    private pullHandle() {
        this.isHandleReset = false;

        const oldPos = this.puck.getCenter();

        // Interpolated position
        const newPos = Phaser.Math.LinearXY(
            this.handle.getCenter(),
            this.pointerPos,
            0.1
        );

        // Calculate distance from puck
        const distance = Phaser.Math.Distance.Between(
            oldPos.x,
            oldPos.y,
            newPos.x,
            newPos.y
        );

        if (distance > this.maxPullDistance) {
            // Normalize direction
            const direction = new Phaser.Math.Vector2(
                newPos.x - oldPos.x,
                newPos.y - oldPos.y
            )
                .normalize()
                .scale(this.maxPullDistance); // Scale to maxPullDistance

            // Constrain position to maxPullDistance
            newPos.x = oldPos.x + direction.x;
            newPos.y = oldPos.y + direction.y;
        }

        this.handle.setPosition(newPos.x, newPos.y);
    }

    private readyShootHandle() {
        this.handle.setVelocity(0, 0);
        this.canHandleShoot = true;
    }

    private startShootHandle() {
        this.isHandleInMotion = true;
        this.canHandleShoot = false;
    }

    private shootHandle() {
        const direction = Phaser.Math.Angle.BetweenPoints(
            this.handle.getCenter(),
            this.puck.getCenter()
        );
        const accelerate = 0.0005;
        const forceVector = new Phaser.Math.Vector2(
            Math.cos(direction) * accelerate,
            Math.sin(direction) * accelerate
        );

        this.handle.applyForce(forceVector);
    }

    private isCenterContact(): boolean {
        const handleLocalPos = this.worldToLocalPos(this.handle.getCenter());
        const pointerLocalPos = this.worldToLocalPos(this.pointerPos);

        const result =
            Math.sign(handleLocalPos.x) === -Math.sign(pointerLocalPos.x) &&
            Math.sign(handleLocalPos.y) === -Math.sign(pointerLocalPos.y)
                ? true
                : false;

        return result;
    }

    private getState() {
        // When puck handle is at the center of the puck and not interacted with
        if (this.isHandleReset && !this.isHandlePulling) return Handle.CENTER;
        // When player is pulling the puck handle
        else if (this.isHandlePulling) return Handle.PULLING;
        // 1 frame after player releases the puck handle
        else if (
            !this.isHandleReset &&
            !this.isHandlePulling &&
            !this.canHandleShoot &&
            !this.isHandleInMotion
        )
            return Handle.RELEASE;
        // When the puck gets ready to travel
        else if (this.canHandleShoot) return Handle.START_SHOOT;
        // When the puck is in motion
        else if (this.isHandleInMotion) return Handle.SHOOTING;
    }

    private renderSling(
        puckX: number,
        puckY: number,
        handleX: number,
        handleY: number
    ) {
        const r = Phaser.Math.Distance.Between(puckX, puckY, handleX, handleY);
        const pr = this.puckRadius;
        const hr = this.handleRadius;
        const angle = Phaser.Math.Angle.BetweenPoints(
            { x: puckX, y: puckY },
            { x: handleX, y: handleY }
        );
        const alpha = Math.asin((pr - hr) / r);
        const beta = Math.PI * 2 + alpha;

        const a1 = pr * Math.sin(alpha - angle) + puckX;
        const a2 = pr * Math.cos(alpha - angle) + puckY;

        const b1 = hr * Math.sin(beta - angle) + handleX;
        const b2 = hr * Math.cos(beta - angle) + handleY;

        const c1 = hr * -Math.sin(-beta - angle) + handleX;
        const c2 = hr * -Math.cos(-beta - angle) + handleY;

        const d1 = pr * -Math.sin(-alpha - angle) + puckX;
        const d2 = pr * -Math.cos(-alpha - angle) + puckY;

        this.slingPolygon.setTo([a1, a2, b1, b2, c1, c2, d1, d2]);
        this.slingGraphics.clear();
        this.slingGraphics.fillPoints(this.slingPolygon.points, true);
    }

    private renderArrow(
        puckX: number,
        puckY: number,
        handleX: number,
        handleY: number
    ) {
        const scaler = Phaser.Math.Distance.BetweenPoints(
            this.puck.getCenter(),
            this.handle.getCenter()
        );

        // Interpolate scaler between 0 and 1
        const normzscaler = Phaser.Math.Clamp(
            scaler / this.maxPullDistance,
            0,
            1
        );

        const k = this.puckRadius + 10 * normzscaler;
        const l = 32 * normzscaler;
        const m = 20 * normzscaler;

        const angle =
            -1 *
            (Phaser.Math.Angle.BetweenPoints(
                { x: puckX, y: puckY },
                { x: handleX, y: handleY }
            ) +
                Math.PI / 2);

        const a1 = (k + l) * Math.sin(angle) + puckX;
        const a2 = (k + l) * Math.cos(angle) + puckY;

        const c1 = k * Math.sin(angle) + puckX;
        const c2 = k * Math.cos(angle) + puckY;

        const b1 = m * Math.sin(angle + Math.PI / 2) + c1;
        const b2 = m * Math.cos(angle + Math.PI / 2) + c2;

        const d1 = m * Math.sin(angle - Math.PI / 2) + c1;
        const d2 = m * Math.cos(angle - Math.PI / 2) + c2;

        this.arrowPolygon.setTo([a1, a2, b1, b2, c1, c2, d1, d2]);
        this.arrowGraphics.clear();
        this.arrowGraphics.fillPoints(this.arrowPolygon.points, true);
    }

    public update() {
        if (this.isPuckInMotion) {
            this.handle.setPosition(this.puck.x, this.puck.y);
            this.center.setPosition(this.puck.x, this.puck.y);

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
                case Handle.PULLING:
                    this.pullHandle();
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

            this.renderSling(
                this.puck.x,
                this.puck.y,
                this.handle.x,
                this.handle.y
            );
            this.renderArrow(
                this.puck.x,
                this.puck.y,
                this.handle.x,
                this.handle.y
            );
        }
    }
}

