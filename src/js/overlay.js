import gsap from 'gsap';

class Cell {
    DOM = {
        el: null
    };
    row;
    column;

    constructor(row, column) {
        this.DOM.el = document.createElement('div');
        this.DOM.el.className = 'cell';
        this.row = row;
        this.column = column;
    }
}

export class Overlay {
    DOM = {
        el: null
    };
    cells = [];
    options = {
        rows: 10,
        columns: 10,
    };
  
    constructor(DOM_el, customOptions) {    
        this.DOM.el = DOM_el;
        
        this.options = Object.assign({}, this.options, customOptions);
        
        this.DOM.el.style.setProperty('--columns', this.options.columns);
        
        this.cells = new Array(this.options.rows);
        for (let i = 0; i < this.options.rows; ++i) {
            this.cells[i] = new Array(this.options.columns);
        }

        for (let i = 0; i < this.options.rows; ++i) {
            for (let j = 0; j < this.options.columns; ++j) {
                const cell = new Cell(i,j);
                this.cells[i][j] = cell;
                this.DOM.el.appendChild(cell.DOM.el);
            }
        }
    }

    show(customConfig = {}) {
        return new Promise((resolve) => {
            const defaultConfig = {
                transformOrigin: '50% 50%',
                duration: 0.5,
                ease: 'none',
                stagger: {
                    grid: [this.options.rows, this.options.columns],
                    from: 0,
                    each: 0.05,
                    ease: 'none'
                }
            };
            const config = Object.assign({}, defaultConfig, customConfig);

            gsap.set(this.DOM.el, {opacity: 1, pointerEvents: 'auto'});
            gsap.fromTo(this.cells.flat().map(cell => cell.DOM.el), {
                scale: 0,
                opacity: 0,
                transformOrigin: config.transformOrigin
            }, {
                duration: config.duration,
                ease: config.ease,
                scale: 1.01,
                opacity: 1,
                stagger: config.stagger,
                onComplete: resolve
            });
        });
    }
    hide(customConfig = {}) {
        return new Promise((resolve) => {
            const defaultConfig = {
                transformOrigin: '50% 50%',
                duration: 0.5,
                ease: 'none',
                stagger: {
                    grid: [this.options.rows, this.options.columns],
                    from: 0,
                    each: 0.05,
                    ease: 'none'
                }
            };
            const config = Object.assign({}, defaultConfig, customConfig);

            gsap.fromTo(this.cells.flat().map(cell => cell.DOM.el), {
                transformOrigin: config.transformOrigin
            }, {
                duration: config.duration,
                ease: config.ease,
                scale: 0,
                opacity: 0,
                stagger: config.stagger,
                onComplete: () => {
                    gsap.set(this.DOM.el, { pointerEvents: 'none' });
                    resolve();
                }
            });
        });
    }
}
