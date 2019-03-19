/**
 * Call our functions on window load event
 */
window.onload = function(){

    setup();
};

/**
 * object to keep track of our magic numbers for margins
 * @type {{top: number, left: number, bottom: number, right: number}}
 */
const MARGINS = {top: 10, right: 10, bottom: 60, left: 60};

var Scatterplot = function(xValue, yValue, circColour){
    this.data;          // contains our dataset
    this.width;   // default value of 800
    this.height; // default value of 500

    this.svgContainer;  // the SVG element where we will be drawing our vis
    this.datapoints;    // SVG elements per data point

    // D3 axes
    this.xAxis;
    this.yAxis;

    // D3 scales
    this.xAxisScale;
    this.yAxisScale;

    /**
     * Function setupScales initializes D3 scales for our x and y axes
     * @param xRange (required) array containing the bounds of the interval we are scaling to (e.g., [0,100]) for the x-axis
     * @param xDomain (required) array containing the bounds of the interval from which our input comes from (e.g., [0,1] for the x-axis
     * @param yRange (required) array containing the bounds of the interval we are scaling to (e.g., [0,100]) for the y-axis
     * @param yDomain (required) array containing the bounds of the interval from which our input comes from (e.g., [0,1] for the y-axis
     */
    this.setupScales = function(xRange, xDomain, yRange, yDomain){
        this.xAxisScale = d3.scaleLinear()
            .domain(xDomain)
            .range(xRange);

        this.yAxisScale = d3.scaleLinear()
            .domain(yDomain)
            .range(yRange);
    };

    /**
     * Function setupAxes initializes D3 axes for our Scatterplot
     * @param xLabel the label of the x-axis
     * @param yLabel the label of the y-axis
     */
    this.setupAxes = function(xLabel, yLabel){
        xLabel = xLabel === undefined ? xValue : xLabel;
        yLabel = yLabel === undefined ? yValue : yLabel;

        // call d3's axisBottom for the x-axis
        this.xAxis = d3.axisBottom(this.xAxisScale)
            .tickSize(-this.height + MARGINS.bottom + MARGINS.top)
            .ticks(10)
            .tickPadding(10);
        // call d3's axisLeft for the y-axis
        this.yAxis = d3.axisLeft(this.yAxisScale)
            .tickSize(-this.width + MARGINS.left*2)
            .ticks(10)
            .tickPadding(10);

        // call our axes inside "group" (<g></g>) objects inside our SVG container
        this.svgContainer.append("g")
            .attr("transform", `translate(0, ${this.height - MARGINS.bottom })`)
            .call(this.xAxis);
        this.svgContainer.append("g")
            .attr("transform", `translate(${MARGINS.left}, 0)`)
            .call(this.yAxis);

        // add text labels
        this.svgContainer.append("text")
            .attr("x", MARGINS.left)
            .attr("y", (this.height)/2)
            .attr("transform", `rotate(-90, ${MARGINS.left / 3}, ${this.height/2})`)
            .style("text-anchor", "middle")
            .text(yLabel);
        this.svgContainer.append("text")
            .attr("x", (this.width)/2)
            .attr("y", (this.height - MARGINS.top))
            .style("text-anchor", "middle")
            .text(xLabel);

        var brush = d3.brush()
            .on("brush", highlightBrushedCircles)
            .on("end", console.log("test"));


        this.svgContainer.append("g")
            .call(brush);


    };

    function highlightBrushedCircles() {

        if (d3.event.selection != null) {

            var circles = d3.selectAll("circle");
            // revert circles to initial style
            circles.attr("class", "non_brushed");

            var brush_coords = d3.brushSelection(this);

            // style brushed circles
            circles.filter(function (){

                var cx = d3.select(this).attr("cx"),
                    cy = d3.select(this).attr("cy");

                return isBrushed(brush_coords, cx, cy);
            })
                .attr("class", "brushed");
        }
    }

    function isBrushed(brush_coords, cx, cy) {

        var x0 = brush_coords[0][0],
            x1 = brush_coords[1][0],
            y0 = brush_coords[0][1],
            y1 = brush_coords[1][1];

        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
    }



    /**
     * Function createCircles initializes the datapoints in our scatterplot
     * @param xAxisSelector the data property for values to appear in x-axis
     * @param yAxisSelector the data property for values to appear in y-axis
     */
    this.createCircles = function(xAxisSelector, yAxisSelector){
        // default to Life Satisfaction and Employment Rate
        xAxisSelector = xAxisSelector === undefined ? xValue : xAxisSelector;
        yAxisSelector = yAxisSelector === undefined ? yValue : yAxisSelector;

        // Use D3's selectAll function to create instances of SVG:circle virtually
        // per item in our data array
        this.datapoints = this.svgContainer.selectAll("circle")
            .data(this.data)    // use the data we loaded from CSV
            .enter()            // access the data item (e.g., this.data[0])
            .append("circle")   // add the circle element into our SVG container
            .attr("r", 4)       // change some of the attributes of our circles
            // function(d){ return d; } -> allows us to access the data we entered
            .attr("cx", function(d){
                // use the D3 scales we created earlier to map our data values to pixels on screen
                return _vis.xAxisScale(d[xAxisSelector]);
            })
            .attr("cy", function(d){
                return _vis.yAxisScale(d[yAxisSelector]);
            })
            // change some styling
            .style("fill", circColour)
            .style("stroke", "white")
            // add a text to show up on hover
            .append("svg:title")
            .text(function(d){
                return d.Player;
            });
    }
};

/**
 * Global variables
 */
var _vis;               // our visualization
var _vis2;
var _vis3;



/**
 * Function setup: sets up our visualization environment.
 * You can change the code to not have static paths and elementID's
 */
function setup(){
    _vis = new Scatterplot("Salary", "Points", "teal");
    _vis.svgContainer = d3.select("#vis");
    // dynamically change our SVG container's dimensions with the current browser dimensions
    _vis.width = _vis.svgContainer.node().getBoundingClientRect().width != undefined ?
        _vis.svgContainer.node().getBoundingClientRect().width :
        _vis.width;
    _vis.height = _vis.svgContainer.node().getBoundingClientRect().height != undefined ?
        _vis.svgContainer.node().getBoundingClientRect().height :
        _vis.height;
    _vis.width= 1600;


    loadData("NBA_2018-19_Data - Worksheet.csv", _vis, 40);


    _vis2 = new Scatterplot("Salary", "Rebounds", "navy");
    _vis2.svgContainer = d3.select("#vis2");
    // dynamically change our SVG container's dimensions with the current browser dimensions
    _vis2.width = _vis2.svgContainer.node().getBoundingClientRect().width != undefined ?
        _vis2.svgContainer.node().getBoundingClientRect().width :
        _vis2.width;
    _vis2.height = _vis2.svgContainer.node().getBoundingClientRect().height != undefined ?
        _vis2.svgContainer.node().getBoundingClientRect().height :
        _vis2.height;

    _vis2.width = 800;




    loadData("NBA_2018-19_Data - Worksheet.csv", _vis2, 15);


    _vis3 = new Scatterplot("Salary", "Assists", "red");
    _vis3.svgContainer = d3.select("#vis3");
    _vis3.width = 800;
    _vis3.height = _vis3.svgContainer.node().getBoundingClientRect().height != undefined ?
        _vis3.svgContainer.node().getBoundingClientRect().height :
        _vis3.height;

    // dynamically change our SVG container's dimensions with the current browser dimensions




    loadData("NBA_2018-19_Data - Worksheet.csv", _vis3, 20);
}



/**
 * Function loadData: loads data from a given CSV file path/url
 * @param path string location of the CSV data file
 */
function loadData(path, _visCurrent, yDomain){
    // call D3's loading function for CSV and load the data to our global variable _data
    d3.csv(path).then(function(data){
        _visCurrent.data = data;
        // let's use the scales and domain from Life Satisfaction and Employment Rate
        _visCurrent.setupScales([MARGINS.left, _visCurrent.width-MARGINS.left], [0, 40000000],
            [_visCurrent.height-MARGINS.bottom, MARGINS.top], [0, yDomain]);
        _visCurrent.setupAxes();
        _visCurrent.createCircles();
    });
}
