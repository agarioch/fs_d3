async function drawLineChart() {
  // 1. Access data

  let dataset = await d3.json("./../../data/nyc_weather_data.json");

  const yAccessor = (d) => d.humidity;
  const dateParser = d3.timeParse("%Y-%m-%d");
  const dateFormatter = d3.timeFormat("%Y-%m-%d");
  const xAccessor = (d) => dateParser(d.date);
  dataset = dataset.sort((a, b) => xAccessor(a) - xAccessor(b));
  const weeks = d3.timeWeeks(
    xAccessor(dataset[0]),
    xAccessor(dataset[dataset.length - 1])
  );

  // 2. Create chart dimensions

  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 400,
    margin: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
    },
  };
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // 3. Draw canvas

  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const bounds = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  const defs = bounds.append("defs");

  // 4. Create scales

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth]);

  // create grid marks
  // const yAxisGeneratorGridMarks = d3
  //   .axisLeft(yScale)
  //   .ticks(3)
  //   .tickSize(-dimensions.boundedWidth)
  //   .tickFormat("");

  // const yAxisGridMarks = bounds
  //   .append("g")
  //   .attr("class", "y-axis-grid-marks")
  //   .call(yAxisGeneratorGridMarks);

  const seasonDates = ["3-1", "6-1", "9-1", "12-1"];
  const seasonNames = ["Spring", "Summer", "Autumn", "Winter"];
  let seasonData = [];

  let startDate = xAccessor(dataset[0]);
  let endDate = xAccessor(dataset[dataset.length - 1]);
  let years = d3.timeYears(d3.timeMonth.offset(startDate, -13), endDate);
  years.forEach((yearDate) => {
    const year = +d3.timeFormat("%Y")(yearDate);
    seasonDates.forEach((season, index) => {
      const seasonStart = dateParser(`${year}-${season}`);
      const seasonEnd = seasonDates[index + 1]
        ? dateParser(`${year}-${seasonDates[index + 1]}`)
        : dateParser(`${year + 1}-${seasonDates[0]}`);
      const fillStart = d3.max([startDate, seasonStart]);
      const fillEnd = d3.min([endDate, seasonEnd]);
      const days = dataset.filter(
        (d) => xAccessor(d) > fillStart && xAccessor(d) <= fillEnd
      );
      if (!days.length) return;
      seasonData.push({
        start: fillStart,
        end: fillEnd,
        name: seasonNames[index],
        mean: d3.mean(days, yAccessor),
      });
    });
  });

  const seasonOffset = 10;
  const seasons = bounds
    .selectAll(".season")
    .data(seasonData)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.start))
    .attr("y", seasonOffset)
    .attr("width", (d) => xScale(d.end) - xScale(d.start))
    .attr("height", dimensions.boundedHeight - seasonOffset)
    .attr("class", (d) => `season ${d.name}`);

  // 5. Draw data

  const dots = bounds
    .selectAll(".dot")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(xAccessor(d)))
    .attr("cy", (d) => yScale(yAccessor(d)))
    .attr("r", 2)
    .attr("class", "dot");

  const lineGenerator = d3
    .area()
    .x((d) => xScale(xAccessor(d)))
    .y((d) => yScale(yAccessor(d)))
    .curve(d3.curveBasis);

  const smoothedDataset = downsampleData(dataset, xAccessor, yAccessor);

  const line = bounds
    .append("path")
    .attr("class", "line")
    .attr("d", lineGenerator(smoothedDataset));

  // 6. Draw peripherals

  const seasonMean = bounds
    .selectAll(".season-mean")
    .data(seasonData)
    .enter()
    .append("line")
    .attr("x1", (d) => xScale(d.start))
    .attr("x2", (d) => xScale(d.end))
    .attr("y1", (d) => yScale(d.mean))
    .attr("y2", (d) => yScale(d.mean))
    .attr("class", "season-mean")
    .attr("stroke-dasharray", "5,5");

  const seasonMeanLabel = bounds
    .append("text")
    .attr("x", -15)
    .attr("y", yScale(seasonData[0].mean))
    .attr("class", "season-mean-label")
    .text("Season Mean");

  const yAxisGenerator = d3.axisLeft().scale(yScale).ticks(3);

  const yAxis = bounds.append("g").attr("class", "y-axis").call(yAxisGenerator);

  const yAxisLabel = bounds
    .append("text")
    .attr("y", -5)
    .attr("x", 15)
    .attr("class", "y-axis-label-suffix")
    .text("relative humidity");

  const xAxisGenerator = d3.axisBottom().scale(xScale).ticks();

  const xAxis = bounds
    .append("g")
    .attr("class", "x-axis")
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)
    .call(xAxisGenerator);

  const seasonLabels = bounds
    .selectAll(".season-label")
    .data(seasonData.slice(0, -1))
    .enter()
    .append("text")
    .attr("x", (d) => (xScale(d.start) + xScale(d.end)) / 2)
    .attr("y", dimensions.height - 10)
    .attr("class", "season-label")
    .text((d) => d.name);
}
drawLineChart();

function downsampleData(data, xAccessor, yAccessor) {
  const weeks = d3.timeWeeks(
    xAccessor(data[0]),
    xAccessor(data[data.length - 1])
  );

  return weeks.map((week, index) => {
    const weekEnd = weeks[index + 1] || new Date();
    const days = data.filter(
      (d) => xAccessor(d) > week && xAccessor(d) <= weekEnd
    );
    return {
      date: d3.timeFormat("%Y-%m-%d")(week),
      humidity: d3.mean(days, yAccessor),
    };
  });
}
