var myJSvar  = JSON.parse({{json|tojson}});
myJSvar = myJSvar.slice(0,20)

var margin = {top:20, right:30, bottom:40,left:200},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0,width]);

var y = d3.scale.ordinal()
    .rangeRoundBands([0, height], 0.1);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickSize(0)
    .tickPadding(3);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

x.domain(d3.extent(myJSvar, function(d) { return d.LATENT_TRAFFIC; })).nice();
y.domain(myJSvar.map(function(d) { return d.SECTOR_NAME; }));

svg.selectAll(".bar")
  .data(myJSvar)
  .enter().append("rect")
  .attr("class", function(d) { return "bar bar--" + (d.LATENT_TRAFFIC < 0 ? "negative" : "positive"); })
  .attr("x", function(d) { return x(Math.min(0, d.LATENT_TRAFFIC)); })
  .attr("y", function(d) { return y(d.SECTOR_NAME); })
  .attr("width", function(d) { return Math.abs(x(d.LATENT_TRAFFIC) - x(0)); })
  .attr("height", y.rangeBand());

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

svg.append("g")
  .attr("class", "y axis")
  .attr("transform", "translate(" + x(0) + ",0)")
  .call(yAxis);