async function drawHeatmap() {
  // import data
  let dataset = await d3.json("./../data/nyc_weather_data.json");
  const parseDate = d3.timeParse("%Y-%m-%d");
  const dateAccessor = (d) => parseDate(d.date);

  dataset = dataset.sort((a, b) => dateAccessor(a) - dateAccessor(b));

  const firstDate = dateAccessor(dataset[0]);
  const weekFormat = d3.timeFormat("%-e");
  const monthFormat = d3.timeFormat("%b");
  const weekdayFormat = d3.timeFormat("%-w");
  const xAccessor = (d) => d3.timeWeeks(firstDate, dateAccessor(d)).length;
  const yAccessor = (d) => +weekdayFormat(dateAccessor(d));

  // define dimensions
  const numberWeeks = Math.ceil(dataset.length / 7) + 1;
  let dimensions = {
    margin: {
      top: 30,
      right: 0,
      bottom: 0,
      left: 80,
    },
  };
  dimensions.width =
    (window.innerWidth - dimensions.margin.left - dimensions.margin.right) *
    0.95;
  dimensions.plotWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.height =
    (dimensions.plotWidth * 7) / numberWeeks +
    dimensions.margin.top +
    dimensions.margin.bottom;
  dimensions.plotHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // draw chart and plot areas
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

  // define scales
  const padding = 0;
  const squareDimensionTotal = d3.min([
    dimensions.plotWidth / numberWeeks,
    dimensions.plotHeight / 7,
  ]);
  const squareDimension = squareDimensionTotal - padding;

  // plot x-axis weeks & months
  const months = plot
    .selectAll(".month")
    .data(
      d3.timeMonths(
        dateAccessor(dataset[0]),
        dateAccessor(dataset[dataset.length - 1])
      )
    )
    .enter()
    .append("text")
    .attr("class", "month")
    .style(
      "transform",
      (d) =>
        `translate(${
          squareDimensionTotal * d3.timeWeeks(firstDate, d).length
        }px, -10px)`
    )
    .text((d) => monthFormat(d));

  // plot y-axis weekday
  const weekdayParse = d3.timeParse("%-e");
  const weektickFormat = d3.timeFormat("%-A");
  const labels = plot
    .selectAll(".label")
    .data(new Array(7).fill(null).map((d, i) => i))
    .enter()
    .append("text")
    .attr("class", "label")
    .attr(
      "transform",
      (d) => `translate(-10, ${squareDimensionTotal * (d + 0.5)})`
    )
    .text((d) => weektickFormat(weekdayParse(d)));

  // plot data
  function drawDays(metric = "moonPhase") {
    d3.select("#metric").text(metric);

    const colorAccessor = (d) => d[metric];
    const colorDomain = d3.extent(dataset, colorAccessor);
    const colorRange = d3
      .scaleLinear()
      .domain(colorDomain)
      .range([0, 1])
      .clamp(true);
    const colorGradient = d3.interpolateHcl("#ecf0f1", "#5758BB");
    const colorScale = (d) => colorGradient(colorRange(d) || 0);

    d3.select("#legend-min").text(colorDomain[0]);
    d3.select("#legend-max").text(colorDomain[1]);
    d3.select("#legend-gradient").style(
      "background",
      "linear-gradient(to right," +
        new Array(10)
          .fill(null)
          .map((d, i) => `${colorGradient(i / 9)} ${(i * 100) / 9}%`)
          .join(", ") +
        ")"
    );

    const days = plot.selectAll(".day").data(dataset, (d) => d.date);

    const newDays = days.enter().append("rect");

    const allDays = newDays
      .merge(days)
      .attr("class", "day")
      .attr("x", (d) => squareDimensionTotal * xAccessor(d))
      .attr("y", (d) => squareDimensionTotal * yAccessor(d))
      .attr("width", squareDimension)
      .attr("height", squareDimension)
      .attr("fill", (d) => colorScale(colorAccessor(d)));

    const oldDays = days.exit().remove();
  }

  // setup interactions
  const metrics = [
    "moonPhase",
    "windSpeed",
    "dewPoint",
    "humidity",
    "uvIndex",
    "windBearing",
    "temperatureMin",
    "temperatureMax",
  ];
  let selectedMetricIndex = 0;
  drawDays(metrics[selectedMetricIndex]);
  const button = d3.select("#heading").append("button").text("Change metric");

  button.node().addEventListener("click", onClick);
  function onClick() {
    selectedMetricIndex = (selectedMetricIndex + 1) % metrics.length;
    drawDays(metrics[selectedMetricIndex]);
  }
}
drawHeatmap();
