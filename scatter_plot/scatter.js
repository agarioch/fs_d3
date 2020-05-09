async function drawScatterPlot() {
  // access data
  const dataset = await d3.json("../data/nyc_weather_data.json");
  const xAccessor = (d) => d.dewPoint;
  const yAccessor = (d) => d.humidity;
  const colorAccessor = (d) => d.cloudCover;

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
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.plotWidth])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.plotHeight, 0]);

  const colorScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, colorAccessor))
    .range(["skyblue", "darkslategrey"]);

  // draw data
  let dots = plotArea
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(xAccessor(d)))
    .attr("cy", (d) => yScale(yAccessor(d)))
    .attr("r", 5)
    .style("fill", (d) => colorScale(colorAccessor(d)));

  // draw axes
  const xAxisGenerator = d3.axisBottom().scale(xScale);

  const xAxis = plotArea
    .append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.plotHeight}px)`);

  const xAxisLabel = xAxis
    .append("text")
    .attr("x", dimensions.plotWidth / 2)
    .attr("y", dimensions.margin.bottom - 10)
    .attr("fill", "black")
    .style("font-size", "1.4em")
    .html("Dew point (&deg;F)");

  const yAxisGenerator = d3.axisLeft().scale(yScale).ticks(4);

  const yAxis = plotArea.append("g").call(yAxisGenerator);

  const yAxisLabel = yAxis
    .append("text")
    .attr("x", -dimensions.plotWidth / 2)
    .attr("y", -dimensions.margin.left + 10)
    .attr("fill", "black")
    .style("font-size", "1.4em")
    .style("transform", "rotate(-90deg)")
    .style("text-anchor", "middle")
    .text("Relative humidity");
}

drawScatterPlot();
