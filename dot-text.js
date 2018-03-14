function calcDistance (p1, p2) {
    return Math.pow(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2), 1 / 2);
}

function getRGBAString (r, g, b, a) {
    return `rgba(${r},${g},${b},${a})`;
}

function shuffleArray (arr) {
    arr = arr.slice();
    const newArr = [];
    while (arr.length) {
        newArr.push(arr.splice(Math.floor(Math.random() * arr.length), 1)[0]);
    }
    return newArr;
}

class Dot {
    constructor ({x, y, r, c}) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.c = c; // color - {r, g, b}
        this.a = 0; // opacity
        this.s = 1; // 1 - def / -1 - removed
        this.n = null; // next action
    }

    update () {
        if(!this.n) return;
        let {t: type, d: data} = this.n;
        switch (type) {
            case 1: // move
                if (this._r) {
                    this.r = this._r;
                    Reflect.deleteProperty(this, '_r');
                }
                let dis = calcDistance([data.x, data.y], [this.x, this.y]);
                let dx = data.x - this.x;
                let dy = data.y - this.y;
                this.x += Math.sign(dx) * Math.max(Math.abs(dx), 10) * 0.08;
                this.y += Math.sign(dy) * Math.max(Math.abs(dy), 10) * 0.08;
                this.a = (1 - (dis - 10) / 200);
                if (dis < 1) {
                    this.n = {t: 2, d: {x: data.x, y: data.y}};
                }
                break;
            case 2: // fixed
                this.x = data.x - Math.sin(Math.random() * Math.PI);
                this.y = data.y - Math.sin(Math.random() * Math.PI);
                break;
            case 3: // remove
                if (!this._r) this._r = this.r;
                this.a -= 0.08;
                this.r -= 0.2;
                if (this.r < 0.2) {
                    this.s = -1;
                    this.n = null;
                }
                break;
        }
    }

    draw (ctx) {
        ctx.fillStyle = getRGBAString(this.c.r, this.c.g, this.c.b, this.a);
        ctx.beginPath();
        ctx.arc(this.x, this.y ,this.r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    move (x, y) {
        this.n = {t: 1, d: {x, y}}
    }

    remove () {
        this.n = {t: 3}
    }
}

const Shape = (() => {
    let canvas, ctx;
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');

    let initCtx = (size, family) => {
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = `bold ${size}px ${family}`;
    };

    return {
        textShape (text, {
            gap = 14,
            textSize = 300,
            textFamily = `'Microsoft YaHei', Helvetica, Arial, monospace`,
        }) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            initCtx(textSize, textFamily);
            let [textW, textH] = [ctx.measureText(text).width, textSize];
            canvas.width = textW + gap - textW % gap;
            canvas.height = textH;
            initCtx(textSize, textFamily);

            ctx.fillText(text, canvas.width / 2, canvas.height / 2);

            let colors = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            let pos = [];
            for (let alphaIndex = 3, x = 0, y = 0; alphaIndex < colors.length; ) {
                if (colors[alphaIndex] > 0) {
                    pos.push([x, y]);
                }
                alphaIndex += (4 * gap);
                x += gap;
                if (x >= canvas.width) {
                    x -= canvas.width;
                    y += gap;
                    alphaIndex += gap * 4 * canvas.width;
                }
            }
            return {
                pos,
                w: textW,
                h: textH
            };
        }
    };
})();

class DotText {

    constructor (canvas) {
        this._ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        this._w = canvas.width;
        this._h = canvas.height;
        this._dots = [];
        this._last = Date.now();
        this._go();
    }

    text (text, config = {}) {
        this._last = Date.now();

        this._param = [text, config];

        let {pos, w: textW, h: textH} = Shape.textShape(text, config);
        pos = shuffleArray(pos);

        if (config.dotSize || config.dotColor) {
            this._dots.forEach(dot => {
                dot.c = config.dotColor || dot.c;
                dot.r = config.dotSize || dot.r;
            })
        }

        let [cur, need] = [this._dots.length, pos.length];

        this.clear([need, cur]); // remove surplus

        let [offsetX, offsetY] = [(this._w - textW) / 2, (this._h - textH) / 2];

        pos.forEach(([x, y], i) => {
            let dot;
            if (i < cur) {
                dot = this._dots[i];
            } else { // make up lack
                dot = new Dot({
                    x: Math.random() * this._w,
                    y: Math.random() * this._h,
                    r: config.dotSize || 5,
                    c: config.dotColor || {r: 255, g: 255, b: 255},
                });
                this._dots.push(dot);
            }
            dot.move(x + offsetX, y + offsetY);
        });
    }

    clear (range) {
        this._last = Date.now();
        let delTime = this._last;

        let [a, b] = range ? range : [0, this._dots.length];
        let delList = this._dots.slice(a, b);
        let repeat = () => {
            if (delTime < this._last) return;
            let dots = delList.splice(0, Math.ceil(delList.length / 25));
            if (!dots.length) return;
            dots.forEach(dot => {
                dot.remove();
            });
            requestAnimationFrame(repeat);
        };

        requestAnimationFrame(repeat);
    }

    resize () {
        let canvas = this._ctx.canvas;
        this._w = canvas.width = canvas.offsetWidth;
        this._h = canvas.height = canvas.offsetHeight;
        if (this._param) {
            clearTimeout(this._resizing);
            this._resizing = setTimeout(() => {
                this.text(...this._param);
                Reflect.deleteProperty(this, '_resizing');
            }, 100);
        }
    }

    _go () {
        let ctx = this._ctx;
        ctx.clearRect(0, 0, this._w, this._h);
        this._dots.forEach((dot, i) => {
            if (dot.s === -1) { // remove dot when status = removed
                this._dots.splice(i, 1);
                return;
            }
            dot.update();
            dot.draw(ctx);
        });
        requestAnimationFrame(this._go.bind(this));
    }

}

export default DotText;

