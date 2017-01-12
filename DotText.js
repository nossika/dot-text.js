(factory => {
    let root = (typeof self == 'object' && self.self === self && self) ||
        (typeof global == 'object' && global.global === global && global);
    if (typeof define === 'function' && define.amd) {
        define([], ()=> {
            root.DotText = factory();
        });
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.DotText = factory();
    }
})(() => {
    const calc_dis = (p1, p2) => {
        return Math.pow(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2), 1 / 2);
    };

    const get_rgba = (r, g, b, a) => {
        return `rgba(${r},${g},${b},${a})`;
    };

    const shuffle_arr = (arr) => {
        arr = arr.slice();
        let new_arr = [];
        while (arr.length) {
            new_arr.push(arr.splice(Math.floor(Math.random() * arr.length), 1)[0]);
        }
        return new_arr;
    };

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
                    let dis = calc_dis([data.x, data.y], [this.x, this.y]);
                    let dx = data.x - this.x;
                    let dy = data.y - this.y;
                    this.x += Math.sign(dx) * Math.max(Math.abs(dx), 10) * 0.08;
                    this.y += Math.sign(dy) * Math.max(Math.abs(dy), 10) * 0.08;
                    this.a = (1 - (dis - 10) / 200);
                    if(dis < 1) {
                        this.n = {t: 2, d: {x: data.x, y: data.y}};
                    }
                    break;
                case 2: // fixed
                    this.x = data.x - Math.sin(Math.random() * Math.PI);
                    this.y = data.y - Math.sin(Math.random() * Math.PI);
                    break;
                case 3: // remove
                    if(!this._r) this._r = this.r;
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
            ctx.fillStyle = get_rgba(this.c.r, this.c.g, this.c.b, this.a);
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

    const Shape = (()=>{
        let canvas, ctx;
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');

        let init_ctx = (size, family) => {
            ctx.fillStyle = '#000';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.font = `bold ${size}px ${family}`;
        };

        return {
            text_shape (text, {
                dot_gap = 14,
                text_size = 300,
                text_family = `'Microsoft YaHei', Helvetica, Arial, monospace`,
            }) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                init_ctx(text_size, text_family);

                let [text_w, text_h] = [ctx.measureText(text).width, text_size];

                canvas.width = text_w + dot_gap - text_w % dot_gap;
                canvas.height = text_h;
                init_ctx(text_size, text_family);

                ctx.fillText(text, canvas.width / 2, canvas.height / 2);

                let colors = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                let pos = [];
                for (let a_index = 3, x = 0, y = 0; a_index < colors.length; ) {
                    if (colors[a_index] > 0) {
                        pos.push([x, y]);
                    }
                    a_index += (4 * dot_gap);
                    x += dot_gap;
                    if (x >= canvas.width) {
                        x -= canvas.width;
                        y += dot_gap;
                        a_index += dot_gap * 4 * canvas.width;
                    }
                }
                return {
                    pos,
                    w: text_w,
                    h: text_h
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

            let {pos, w: text_w, h: text_h} = Shape.text_shape(text, config);
            pos = shuffle_arr(pos);

            if (config.dot_size || config.dot_color) {
                this._dots.forEach(dot => {
                    dot.c = config.dot_color || dot.c;
                    dot.r = config.dot_size || dot.r;
                })
            }

            let [cur, need] = [this._dots.length, pos.length];

            this.clear([need, cur]); // remove surplus

            let [offset_x, offset_y] = [(this._w - text_w) / 2, (this._h - text_h) / 2];

            pos.forEach(([x, y], i) => {
                let dot;
                if (i < cur) {
                    dot = this._dots[i];
                } else { // make up lack
                    dot = new Dot({
                        x: Math.random() * this._w,
                        y: Math.random() * this._h,
                        r: config.dot_size || 5,
                        c: config.dot_color || {r: 255, g: 255, b: 255}
                    });
                    this._dots.push(dot);
                }
                dot.move(x + offset_x, y + offset_y);
            });
        }
        clear (range) {
            this._last = Date.now();
            let del_time = this._last;

            let [a, b] = range ? range : [0, this._dots.length];
            let del_list = this._dots.slice(a, b);
            let repeat = () => {
                if(del_time < this._last) return;
                let dots = del_list.splice(0, Math.ceil(del_list.length / 25));
                if(!dots.length) return;
                dots.forEach(dot => {
                    dot.remove();
                });
                requestAnimationFrame(repeat);
            };

            requestAnimationFrame(repeat)
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
                }, 200);
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
    return DotText;
});
