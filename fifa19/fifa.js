async function mainChart(metric = "Overall") {
  // access data
  const dataset = await d3.csv("../data/fifa19/data.csv");
  console.table(dataset[1]);

  // assign chart dimensions
  const width = 800;
  const dimensions = {
    width: width,
    height: width * 0.5,
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
    .select("#main")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const plot = chart
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  plot.append("g").attr("class", "histogram");
  plot.append("line").attr("class", "meanLine");
  plot.append("text").attr("class", "meanLabel");

  const drawHistogram = (metric = "Overall") => {
    const metricAccessor = (d) => parseFloat(d[metric]) || 0;
    const yAccessor = (d) => d.length;

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

    const exitTransition = d3.transition().duration(150);
    const updateTransition = exitTransition.transition().duration(300);

    // plot data
    let binGroups = plot.select(".histogram").selectAll(".bin").data(bins);

    const oldBinGroups = binGroups.exit();
    oldBinGroups
      .selectAll("rect")
      .style("fill", "#d73a49")
      .transition(exitTransition)
      .attr("y", dimensions.plotHeight)
      .attr("height", 0);
    oldBinGroups
      .selectAll("text")
      .transition(exitTransition)
      .attr("y", dimensions.plotHeight);
    oldBinGroups.transition(exitTransition).remove();

    const newBinGroups = binGroups.enter().append("g").attr("class", "bin");

    newBinGroups
      .append("rect")
      .attr("height", 0)
      .attr("x", (d) => xScale(d.x0 + barPadding))
      .attr("y", dimensions.plotHeight)
      .attr("width", (d) =>
        d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding])
      )
      .style("fill", "#79b8ff");
    newBinGroups
      .append("text")
      .attr("x", (d) => xScale(d.x0) + barPadding)
      .attr("y", dimensions.plotHeight);

    binGroups = newBinGroups.merge(binGroups);

    const bars = binGroups
      .select("rect")
      .transition(updateTransition)
      .attr("x", (d) => xScale(d.x0) + barPadding / 2)
      .attr("y", (d) => yScale(yAccessor(d)))
      .attr("width", (d) =>
        d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding])
      )
      .attr("height", (d) => dimensions.plotHeight - yScale(yAccessor(d)))
      .transition()
      .style("fill", "#0366d6");

    const barLabels = binGroups
      .select("text")
      .transition(updateTransition)
      .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
      .attr("y", (d) => yScale(yAccessor(d)) - 5)
      .text((d) => yAccessor(d) || "")
      .style("text-anchor", "middle")
      .style("font-size", "0.7rem");

    const mean = d3.mean(dataset, metricAccessor);
    const meanLine = plot
      .select(".meanLine")
      .transition(updateTransition)
      .attr("x1", xScale(mean))
      .attr("x2", xScale(mean))
      .attr("y1", -20)
      .attr("y2", dimensions.plotHeight)
      .attr("stroke", "#24292e")
      .attr("stroke-dasharray", "5,5");

    const meanLabel = plot
      .select(".meanLabel")
      .transition(updateTransition)
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
      .text(metric)
      .style("font-size", "1.2rem");
  };

  detailsArea = document.getElementById("details");
  console.log(detailsArea);
  detailsArea.addEventListener("click", (e) => updateMainChart(e));

  function updateMainChart(e) {
    targetChart = e.target.closest("svg");
    if (targetChart.nodeName == "svg") {
      drawHistogram(targetChart.id);
      window.scroll({
        top: 0,
        behavior: "smooth",
      });
    }
  }
  drawHistogram();
}

// ======= DETAILS =======

async function histograms() {
  // access data
  const dataset = await d3.csv("../data/fifa19/data.csv");
  const yAccessor = (d) => d.length;

  // assign chart dimensions
  const width = 400;
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

  // ======= DRAW DETAILS HISTOGRAMS =======

  function drawHistogram(metric) {
    const metricAccessor = (d) => parseFloat(d[metric]) || 0;

    // draw chart and plot area
    const chart = d3
      .select("#details")
      .append("svg")
      .attr("id", metric)
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
      .domain([0, 100])
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
      .attr("width", (d) =>
        d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding])
      )
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
      .attr("font-size", "0.7rem")
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
      .text(metric)
      .style("font-size", "1rem");
  }
  metrics = [
    "Overall",
    "Potential",
    "Finishing",
    "LongShots",
    "Dribbling",
    "Crossing",
    "Stamina",
    "Aggression",
    "Vision",
    "Acceleration",
    "SprintSpeed",
    "BallControl",
    "ShortPassing",
    "LongPassing",
  ];
  metrics.forEach(drawHistogram);
}

histograms();
mainChart();
