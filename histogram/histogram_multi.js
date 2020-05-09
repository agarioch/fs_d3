async function drawHistogram() {
  // data
  const dataset = await d3.json("../data/nyc_weather_data.json");

  // dimensions
  const width = 600;
  const dimensions = {
    width: width,
    height: width * 0.6,
    margin: {
      top: 40,
      right: 20,
      bottom: 100,
      left: 50,
    },
  };
  dimensions.plotWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.plotHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  const addHistogram = (metric) => {
    const metricAccessor = (d) => d[metric];
    const yAccessor = (d) => d.length; //histogram bin array length

    // generate chart and plot areas
    const chart = d3
      .select("#wrapper")
      .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    const plot = chart
      .append("g")
      .style(
        "transform",
        `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
      );

    chart.attr("role", "figure").attr("tabindex", 0);

    chart
      .append("title")
      .text("Histogram showing distribution of " + metric + " in 2018");

    // create scale
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(dataset, metricAccessor))
      .range([0, dimensions.plotWidth])
      .nice();

    const binsGenerator = d3
      .histogram()
      .domain(xScale.domain())
      .value(metricAccessor)
      .thresholds(12);

    const bins = binsGenerator(dataset);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(bins, yAccessor)])
      .range([dimensions.plotHeight, 0])
      .nice();
    console.log(yScale.domain());

    // draw data
    const binsGroup = plot
      .append("g")
      .attr("tabindex", 0)
      .attr("role", "list")
      .attr("aria-label", "histogram bars");
    const barSpacing = 1;
    const binGroups = binsGroup.selectAll("g").data(bins).enter().append("g");
    const bars = binGroups
      .append("rect")
      .attr("x", (d) => xScale(d.x0) + barSpacing / 2)
      .attr("y", (d) => yScale(yAccessor(d)))
      .attr("width", (d) =>
        d3.max([0, xScale(d.x1) - xScale(d.x0) - barSpacing])
      )
      .attr("height", (d) => dimensions.plotHeight - yScale(yAccessor(d)))
      .attr("fill", "cornflowerblue");

    const barLabels = binGroups
      .filter(yAccessor)
      .append("text")
      .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
      .attr("y", (d) => yScale(yAccessor(d)) - 5)
      .text(yAccessor)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .attr("fill", "darkgrey");

    const mean = d3.mean(dataset, metricAccessor);
    const meanLine = plot
      .append("line")
      .attr("x1", xScale(mean))
      .attr("x2", xScale(mean))
      .attr("y1", -15)
      .attr("y2", dimensions.plotHeight)
      .style("stroke", "black")
      .style("stroke-dasharray", "2px 4px");

    const meanLabel = plot
      .append("text")
      .attr("x", xScale(mean))
      .attr("y", -20)
      .text("mean (" + mean.toFixed(3) + ")")
      .attr("fill", "black")
      .style("font-size", "12px")
      .style("text-anchor", "middle");

    // draw axis
    const xAxisGenerator = d3.axisBottom().scale(xScale);

    const xAxis = plot
      .append("g")
      .call(xAxisGenerator)
      .style("transform", `translateY(${dimensions.plotHeight}px)`);

    const xAxisLabel = plot
      .append("text")
      .attr("x", dimensions.plotWidth / 2)
      .attr("y", dimensions.plotHeight + 35)
      .text(metric)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("text-transform", "capitalize");
  };

  const metrics = [
    "windSpeed",
    "moonPhase",
    "dewPoint",
    "humidity",
    "uvIndex",
    "windBearing",
    "temperatureMin",
    "temperatureMax",
    "visibility",
    "cloudCover",
  ];
  metrics.forEach(addHistogram);
}

drawHistogram();
