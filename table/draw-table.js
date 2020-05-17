async function drawTable() {
  // load data
  const dateParser = d3.timeParse("%Y-%m-%d");
  const dateAccessor = (d) => dateParser(d.date);
  let dataset = await d3.json("./../../data/nyc_weather_data.json");
  dataset = dataset.sort((a, b) => dateAccessor(a) - dateAccessor(b));

  const table = d3.select("#table");

  const numberOfRows = 10;

  const dateFormat = (d) => d3.timeFormat("%b %-d")(dateParser(d));
  const timeFormat = (d) => d3.timeFormat("%-I:%M %p")(d);
  const colorScale = d3.interpolateHcl("#a5c3e8", "#efa8a1");
  const tempScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset.slice(0, numberOfRows), (d) => d.temperatureMax))
    .range([0, 1]);
  const grayColorScale = d3.interpolateHcl("#fff", "#bdc4ca");
  const windScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset.slice(0, numberOfRows), (d) => d.windSpeed))
    .range([0, 1]);

  const columns = [
    { label: "Day", type: "text", format: (d) => dateFormat(d.date) },
    { label: "Summary", type: "text", format: (d) => d.summary },
    {
      label: "Max Temp",
      type: "number",
      format: (d) => d3.format(",.1f")(d.temperatureMax),
      background: (d) => colorScale(tempScale(d.temperatureMax)),
    },
    {
      label: "Max Temp Time",
      type: "text",
      format: (d) => timeFormat(d.apparentTemperatureMaxTime),
    },
    {
      label: "Wind Speed",
      type: "number",
      format: (d) => d3.format(",.2f")(d.windSpeed),
      background: (d) => grayColorScale(windScale(d.windSpeed)),
    },
    {
      label: "Precipitation",
      type: "text",
      format: (d) => (d.precipType == "snow" ? "❄" : ""),
    },
    { label: "UV Index", type: "text", format: (d) => "✸".repeat(d.uvIndex) },
  ];

  table
    .append("thead")
    .append("tr")
    .selectAll("thead")
    .data(columns)
    .enter()
    .append("th")
    .text((d) => d.label)
    .attr("class", (d) => d.type);

  const body = table.append("tbody");

  console.log(columns);
  dataset.slice(0, numberOfRows).forEach((d) => {
    body
      .append("tr")
      .selectAll("td")
      .data(columns)
      .enter()
      .append("td")
      .text((column) => column.format(d))
      .attr("class", (column) => column.type)
      .style("background-color", (column) =>
        column.background ? column.background(d) : null
      );
  });
}
drawTable();
