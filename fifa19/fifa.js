async function histograms() {
  // access data
  const dataset = await d3.csv("../data/fifa19/data.csv");
  const metricAccessor = (d) => parseFloat(d.Overall);
  const yAccessor = (d) => d.length;

  console.table(dataset[0]);

  // assign chart dimensions
  const width = 500;
  const dimensions = {
    width: width,
    height: width * 0.6,
    margin: {
      top: 40,
      right: 10,
      bottom: 50,
      left: 50,
    },
  };
  dimensions.plotWidth =
    dimensions.width - dimensions.margin.right - dimensions.margin.left;
  dimensions.plotHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // draw chart and plot area
  const chart = d3
    .select("#details")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const plot = chart
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  // assign scales
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

  bins = binsGenerator(dataset);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(bins, yAccessor)])
    .range([dimensions.plotHeight, 0]);

  const barPadding = 1;

  // plot data
  const histogram = plot.append("g");
  const binGroups = histogram.selectAll("g").data(bins).enter().append("g");
  const bars = binGroups
    .append("rect")
    .attr("x", (d) => xScale(d.x0) + barPadding / 2)
    .attr("y", (d) => yScale(yAccessor(d)))
    .attr("width", (d) => d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding]))
    .attr("height", (d) => dimensions.plotHeight - yScale(yAccessor(d)))
    .attr("fill", "#6a737d");
  const barLabels = binGroups
    .append("text")
    .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
    .attr("y", (d) => yScale(yAccessor(d)) - 5)
    .text((d) => yAccessor(d) || "")
    .style("text-anchor", "middle")
    .style("font-size", "0.7rem");

  const mean = d3.mean(dataset, metricAccessor);
  console.log(mean);
  const meanLine = plot
    .append("line")
    .attr("x1", xScale(mean))
    .attr("x2", xScale(mean))
    .attr("y1", -20)
    .attr("y2", dimensions.plotHeight)
    .attr("stroke", "#24292e")
    .attr("stroke-dasharray", "5,5");

  const meanLabel = plot
    .append("text")
    .attr("x", xScale(mean))
    .attr("y", -25)
    .text(`Avg (${mean.toFixed(0)})`)
    .attr("text-anchor", "middle")
    .style("font-weight", "600");

  // plot axis
  plot
    .append("g")
    .attr("class", "x-axis")
    .style("transform", `translateY(${dimensions.plotHeight}px)`)
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", dimensions.plotWidth / 2)
    .attr("y", dimensions.margin.bottom - 10)
    .attr("fill", "#24292e");

  const xAxisGenerator = d3.axisBottom().scale(xScale);
  const xAxis = plot.select(".x-axis").call(xAxisGenerator);
  const xAxisLabel = xAxis
    .select(".x-axis-label")
    .text("Overall Rating")
    .style("font-size", "1.1rem");
}

histograms();
