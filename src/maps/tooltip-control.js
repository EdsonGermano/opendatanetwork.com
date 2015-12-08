
class MapBounds {
    constructor($div) {
        this.$div = $div;
        this.update();
    }

    update() {
        const { left: x1, top: y1 } = this.$div.offset();
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = this.x1 + this.$div.width();
        this.y2 = this.y1 + this.$div.height();
        this.centerX = this.x1 + (this.x2 - this.x1) / 2;
        this.centerY = this.y1 + (this.y2 - this.y1) / 2;
    }

    normalize([x, y]) {
        return [x - this.x2, y - this.y2];
    }

    atEdge([x, y], threshold=MapConstants.TOOLTIP_EDGE) {
        return (x - this.x1 > 0 && x - this.x1 < threshold) ||
               (x - this.x2 < 0 && x - this.x2 > -threshold) ||
               (y - this.y1 > 0 && y - this.y1 < threshold) ||
               (y - this.y2 < 0 && y - this.y2 > -threshold);
    }

    quadrant([x, y]) {
        return [x - this.centerX > 0 ? 1 : -1,
                y - this.centerY > 0 ? 1 : -1];
    }
}

const TooltipControl = L.Control.extend({
    options: {
        position: 'bottomright'
    },

    onAdd: function(map) {
        const containerDiv = L.DomUtil.create('div', 'tooltip');
        this.container = d3.select(containerDiv)
            .style('display', 'none');

        this.name = this.container
            .append('div')
            .attr('class', 'name');

        this.value = this.container
            .append('div')
            .attr('class', 'value');

        this.shown = false;

        const bounds = new MapBounds($('#leaflet-map'));

        window.onresize = () => {
            bounds.update();
        };

        document.addEventListener('mousemove', (e) => {
            const point = [e.pageX, e.pageY];
            if (bounds.atEdge(point)) {
                console.log(bounds.quadrant(point));
            }

            if (this.shown) {
                const [x, y] = bounds.normalize(point);
                this.container
                    .style('left', `${x - 20}px`)
                    .style('top', `${y - 10}px`);
            }
        });

        return containerDiv;
    },

    show: function(name, value) {
        this.name.text(name);
        this.value.text(value);

        this.unhide();
    },

    showRegion: function(region) {
        this.show(region.name,
                  `${region.valueName} (${region.year}): ${region.valueFormatted}`);
    },

    hide: function() {
        this.shown = false;
        this.container.style('display', 'none');
    },

    unhide: function() {
        this.shown = true;
        this.container.style('display', 'inline');
    }
});

