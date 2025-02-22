class GraphRenderer {
    constructor(containerId, R, points) {
        this.container = document.getElementById(containerId);
        this.svg = d3.select(`#${containerId}`);
        this.pointSize = 5;
        this.axisScale = 5;
        this.R = R;
        this.points = points;
        console.log(points);

        this.initDimensions();
        this.initScales();
        this.setupResizeObserver();
        this.redraw();
    }

    initDimensions() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this.screenCenterX = this.width / 2;
        this.screenCenterY = this.height / 2;
    }

    initScales() {
        this.xScale = d3.scaleLinear()
            .domain([-this.axisScale, this.axisScale])
            .range([0, this.width]);
        this.yScale = d3.scaleLinear()
            .domain([-this.axisScale, this.axisScale])
            .range([this.height, 0]);
        this.xScaleReversed = d3.scaleLinear()
            .domain([0, this.width])
            .range([-this.axisScale, this.axisScale]);
        this.yScaleReversed = d3.scaleLinear()
            .domain([this.height, 0])
            .range([-this.axisScale, this.axisScale]);

        this.updateShapeScales();
    }

    get screenR() {
        return (this.width / (this.axisScale * 2)) * this.R;
    }

    updateShapeScales() {
        this.shapeXScale = d3.scaleLinear()
            .domain([-this.R, this.R])
            .range([this.screenCenterX - this.screenR, this.screenCenterX + this.screenR]);
        this.shapeYScale = d3.scaleLinear()
            .domain([-this.R, this.R])
            .range([this.screenCenterY + this.screenR, this.screenCenterY - this.screenR]);
    }

    setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(() => {
            this.handleResize();
        });
        this.resizeObserver.observe(this.container);
    }

    handleResize() {
        this.initDimensions();
        this.initScales();
        this.redraw();
    }

    redraw() {
        this.clear();
        this.drawAxes();
        this.drawShape();
        this.drawPoints();
    }

    clear() {
        this.svg.selectAll("*").remove();
    }

    drawAxes() {
        const axisXFragments = [d3.axisBottom(this.xScale)
            .ticks(10)
            .tickSize(-this.height / 2), d3.axisBottom(this.xScale)
            .tickFormat('')
            .ticks(10)
            .tickSize(this.height / 2)];
        const axisYFragments = [d3.axisLeft(this.yScale)
            .ticks(10)
            .tickSize(-this.width / 2), d3.axisLeft(this.yScale)
            .tickFormat('')
            .ticks(10)
            .tickSize(this.width / 2)];
        axisXFragments.forEach(axisXFragment => {
            this.svg.append("g")
                .attr("transform", `translate(0, ${this.screenCenterY})`)
                .call(axisXFragment)
                .call(g => g.select(".domain").remove())
                .call(g => g.selectAll(".tick line").attr("stroke", "var(--border-color)"))
                .call(g => g.selectAll(".tick text").attr("fill", "var(--text-color)").attr("transform", "translate(20, 6) rotate(30)"));
        });
        axisYFragments.forEach(axisYFragment => {
            this.svg.append("g")
                .attr("transform", `translate(${this.screenCenterX}, 0)`)
                .call(axisYFragment)
                .call(g => g.select(".domain").remove())
                .call(g => g.selectAll(".tick line").attr("stroke", "var(--border-color)"))
                .call(g => g.selectAll(".tick text").attr("fill", "var(--text-color)").attr("transform", "translate(-2, 6) rotate(-30)"));

        });
    }

    drawShape() {
        this.svg.append("rect")
            .attr("x", this.shapeXScale(-this.R / 2))
            .attr("y", this.shapeYScale(0))
            .attr("width", this.shapeXScale(0) - this.shapeXScale(-this.R / 2))
            .attr("height", this.shapeYScale(0) - this.shapeYScale(this.R))
            .attr("fill", "#F05D23")
            .attr("opacity", "0.3");

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(this.screenR / 2)
            .startAngle(Math.PI * 1.5)
            .endAngle(Math.PI * 2);

        this.svg.append("path")
            .attr("d", arc)
            .attr("fill", "#F05D23")
            .attr("opacity", "0.3")
            .attr("transform", `translate(${this.shapeXScale(0)}, ${this.shapeYScale(0)})`);

        this.svg.append("polygon")
            .attr("points", [[this.shapeXScale(0), this.shapeYScale(0)], [this.shapeXScale(this.R / 2), this.shapeYScale(0)], [this.shapeXScale(0), this.shapeYScale(-this.R / 2)]].join(" "))
            .attr("fill", "#F05D23")
            .attr("opacity", "0.3");

    }

    drawPoints() {

        this.svg.selectAll(".point")
            .data(this.points, d => d.id) // Use key function here
            .join("rect")
            .attr("class", "point")
            .attr("x", d => {
                const xScreen = this.xScale(d.shotX) - this.pointSize / 2;
                return xScreen;
            })
            .attr("y", d => {
                const yScreen = this.yScale(d.shotY) - this.pointSize / 2;
                return yScreen;
            })
            .attr("width", this.pointSize)
            .attr("height", this.pointSize)
            .attr("fill", d => d.result ? "#5dd17c" : "#e45a5a");

    }

    updateRadius(newRadius) {
        this.R = newRadius;
        this.updateShapeScales();
        this.redraw();
    }

    updatePoints(newPoints) {
        this.points = newPoints;
        this.drawPoints();
    }

    destroy() {
        this.resizeObserver.disconnect();
    }
}

let graph;

document.addEventListener("DOMContentLoaded", function () {
    const graphEl = document.getElementById('graph-view');
    graph = new GraphRenderer('graph-view', 3, []);
    graph.updateRadius(graphEl.dataset.radius);
    graph.updatePoints(JSON.parse(graphEl.dataset.points));
    window.renderAll = (radius, points) => {
        graph.updateRadius(radius);
        graph.updatePoints(JSON.parse(points));
    };
});

function handleGraphClick(graphElement, e) {
    const xHiddenInput = document.getElementById('shooterFormHidden:xHidden');
    const yHiddenInput = document.getElementById('shooterFormHidden:yHidden');
    const rect = graphElement.getBoundingClientRect();
    const xOffset = e.clientX - rect.left;
    const yOffset = e.clientY - rect.top;
    xHiddenInput.value = graph.xScaleReversed(xOffset);// Используйте вашу JSON-библиотеку
    yHiddenInput.value = graph.yScaleReversed(yOffset);
    document.getElementById("shooterFormHidden:submitFormHidden").click();
}