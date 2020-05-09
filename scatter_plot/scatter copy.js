async function drawScatterPlot() {
  // access data
  const dataset = await d3.json("../data/nyc_weather_data.json");
  const xAccessor = (d) => d.dewPoint;
  const yAccessor = (d) => d.humidity;

  // define chart dimensions
  const size = d3.min([window.innerWidth * 0.8, window.innerHeight * 0.8]);

  let dimensions = {
    width: size,
    height: size,
    margin: {
      top: 15,
      right: 15,
      bottom: 50,
      left: 50,
    },
  };
  dimensions.plotWidth =
    dimensions.width - dimensions.margin.right - dimensions.margin.left;
  dimensions.plotHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // draw chart and plot area
  const chartArea = d3
    .select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);
  const plotArea = chartArea
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`
    );

  // create scales
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, xAccessor).map((n) => n * 1.1))
    .range([0, dimensions.plotWidth])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor).map((n) => n * 1.1))
    .range([dimensions.plotHeight, 0]);

  // draw data
  let dots = plotArea
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(xAccessor(d)))
    .attr("cy", (d) => yScale(yAccessor(d)))
    .attr("r", 5)
    .style("fill", "#005cc5cc");
  console.log(dots);
}

drawScatterPlot();
