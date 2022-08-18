import ObjectsHelper from "~~/src/Helpers/ObjectsHelper";

/**
 * Одна фигура игры
 */
export class Shape {
    /**
     * Bitmap фигуры
     */
    private bitmap: number[][];
    private x: number = 0;
    private y: number = 0;

    constructor(bitmap: number[][]) {
        // TODO нужно посомтреть как-то можно было сократить конструктор который сетит
        this.bitmap = bitmap;
    }

    get grid() {
        return this.bitmap;
    }

    get position(): {x: number, y: number} {
        return {
            x: this.x,
            y: this.y,
        };
    }

    get maxX(): number {
        const xAdd = Number(this.bitmap[0].length);

        return this.x + xAdd;
    }

    get maxY(): number {
        const yAdd = Number(this.bitmap.length);

        return this.y + yAdd;
    }

    setBitmap(bitmap) {
        this.bitmap = bitmap;
    }

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}