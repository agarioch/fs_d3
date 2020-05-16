async function drawMap() {
  // Access data
  const countryShapes = await d3.json("./../data/world-geojson.json");

  const countryNameAccessor = (d) => d.properties["NAME"];
  const countryIdAccessor = (d) => d.properties["ADM0_A3_IS"];

  const dataset = await d3.csv("./../data/world_data.csv");

  const metric = "Population growth (annual %)";

  let metricDataByCountry = {};

  dataset.forEach((d) => {
    if (d["Series Name"] != metric) return;
    metricDataByCountry[d["Country Code"]] = +d["2018 [YR2018]"] || 0;
  });

  // Define chart dimensions
  let dimensions = {
    width: window.innerWidth * 0.9,
    margin: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  };
  dimensions.plotWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;

  const sphere = { type: "Sphere" };
  const projection = d3.geoEqualEarth().fitWidth(dimensions.plotWidth, sphere);

  const pathGenerator = d3.geoPath(projection);
  const [[x0, y0], [x1, y1]] = pathGenerator.bounds(sphere);

  // Finish updating dimensions with projection height
  dimensions.plotHeight = y1;
  dimensions.height =
    dimensions.plotHeight + dimensions.margin.top + dimensions.margin.bottom;

  // plot chart canvas
  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const plot = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  // Create scales
  const metricValues = Object.values(metricDataByCountry);
  const metricValueExtent = d3.extent(metricValues);
  const maxChange = d3.max([-metricValueExtent[0], metricValueExtent[1]]);
  const colorScale = d3
    .scaleLinear()
    .domain([-maxChange, 0, maxChange])
    .range(["indigo", "white", "darkgreen"]);

  // plot data
  const earth = plot
    .append("path")
    .attr("class", "earth")
    .attr("d", pathGenerator(sphere));

  const graticuleJson = d3.geoGraticule10();
  const graticule = plot
    .append("path")
    .attr("class", "graticule")
    .attr("d", pathGenerator(graticuleJson));

  const countries = plot
    .selectAll(".country")
    .data(countryShapes.features)
    .enter()
    .append("path")
    .attr("d", pathGenerator)
    .attr("class", "country")
    .attr("fill", (d) => {
      const metricValue = metricDataByCountry[countryIdAccessor(d)];
      if (typeof metricValue == "undefined") return "#e2e6e9";
      return colorScale(metricValue);
    });

  // draw peripherals
  const legendWidth = 120;
  const legendHeight = 16;
  const legendGroup = wrapper
    .append("g")
    .attr(
      "transform",
      `translate(${120}, ${
        dimensions.width < 800
          ? dimensions.plotHeight - 30
          : dimensions.plotHeight * 0.5
      })`
    );
  const legendTitle = legendGroup
    .append("text")
    .attr("y", -23)
    .attr("class", "legend-title")
    .text(metric);

  const legendByline = legendGroup
    .append("text")
    .attr("y", -9)
    .attr("class", "legend-byline")
    .text("Percentage change in 2018");

  const defs = wrapper.append("defs");
  const legendGradientId = "legend-gradient";
  const gradient = defs
    .append("linearGradient")
    .attr("id", legendGradientId)
    .selectAll("stop")
    .data(colorScale.range())
    .enter()
    .append("stop")
    .attr("stop-color", (d) => d)
    .attr("offset", (d, i) => `${(i * 100) / 2}%`);

  const legendGradient = legendGroup
    .append("rect")
    .attr("x", -legendWidth / 2)
    .attr("height", legendHeight)
    .attr("width", legendWidth)
    .style("fill", `url(#${legendGradientId})`);

  const legendValueRight = legendGroup
    .append("text")
    .attr("class", "legend-value")
    .attr("x", legendWidth / 2 + 10)
    .attr("y", legendHeight / 2)
    .text(`${d3.format(".1f")(maxChange)}%`);

  legendValueLeft = legendGroup
    .append("text")
    .attr("class", "legend-value")
    .attr("x", -legendWidth / 2 - 10)
    .attr("y", legendHeight / 2)
    .text(`${d3.format(".1f")(-maxChange)}%`)
    .style("text-anchor", "end");

  navigator.geolocation.getCurrentPosition((myPosition) => {
    const [x, y] = projection([
      myPosition.coords.longitude,
      myPosition.coords.latitude,
    ]);
    const myLocation = plot
      .append("circle")
      .attr("class", "my-location")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 0)
      .transition()
      .duration(500)
      .attr("r", 5);
  });

  // set up interactions
  countries.on("mouseenter", onMouseEnter).on("mouseleave", onMouseLeave);

  const tooltip = d3.select("#tooltip");

  function onMouseEnter(data) {
    const [centerX, centerY] = pathGenerator.centroid(data);
    const x = centerX + dimensions.margin.left;
    const y = centerY + dimensions.margin.top;

    tooltip
      .style(
        "transform",
        `translate(calc(-50% + ${x}px), calc(-100% + ${y}px))`
      )
      .style("opacity", 1);
    const tooltipCountry = tooltip.select(".tooltip-country");
    tooltipCountry.text(countryNameAccessor(data));
    const tooltipValue = tooltip.select(".tooltip-value");
    tooltipValue.text(
      d3.format(".1f")(metricDataByCountry[countryIdAccessor(data)]) + "%"
    );
  }
  function onMouseLeave() {
    tooltip.style("opacity", 0);
  }
}
drawMap();
