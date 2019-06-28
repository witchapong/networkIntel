let store = {}
function loadData() {
    return Promise.all([
        d3.json("http://127.0.0.1:5000/getSectorTraffic"),
        d3.json("http://127.0.0.1:5000/getSectorRaw"),
        d3.json("http://127.0.0.1:5000/getSectorTraffic2"),
        d3.json("http://127.0.0.1:5000/getSectorRaw2")
        ]).then(datasets => {
            store.sum = datasets[0]
            store.raw = datasets[1]
            store.sum2 = datasets[2]
            store.raw2 = datasets[3]
            return store;
        })
}

function showData() {

    let sectors = store.sum.slice(0,10);

    // preconfig raw chart
    raw_config = getRawChartConfig("#rawChart")

    // draw vertical barchart for sectors
    drawBarChartAll(sectors,raw_config, "#barChart", "raw", "#rawChart")

    // show date text
    showDateText(store.sum[0].date_time)

    let sectors2 = store.sum2.slice(0,10)

    // preconfig raw chart2
    raw_config2 = getRawChartConfig("#rawChart2")

    // draw vertical barchart for sectors
    drawBarChartAll(sectors2,raw_config2, "#barChart2", "raw2", "#rawChart2")
}

function drawBarChartAll(sectors, raw_config, barChartID, key, rawChartID) {
    let config = getBarChartConfig(barChartID);
    let scales = getBarChartScales(sectors, config);
    drawBarChart(sectors, scales, config, raw_config, key, rawChartID);
    drawBarChartAxes(sectors, scales, config);
}

function getBarChartConfig(chartID) {
    let width = 500;
    let height = 400;
    let margin = {
        top: 10,
        bottom: 50,
        left: 100,
        right: 10
    }

    let bodyHeight = height - margin.top - margin.bottom
    let bodyWidth = width - margin.left - margin.right

    let container = d3.select(chartID)
    container
        .attr("width", width)
        .attr("height", height)

    return { width, height, margin, bodyHeight, bodyWidth, container}
}

function getBarChartScales(sectors, config) {
    let { bodyWidth, bodyHeight} = config;

    let maxTraffic = d3.max(sectors,
        (d) => d.latent_traffic)

    let xScale = d3.scaleLinear()
        .range([0,bodyWidth])
        .domain([0,maxTraffic])

    let yScale = d3.scaleBand()
        .range([0, bodyHeight])
        .domain(sectors.map(d => d.sector))
        .padding(0.2)

    return {xScale, yScale}
}

function drawBarChart(sectors, scales, config, raw_config, key, rawChartID) {
    let {margin, container} = config;
    let {xScale, yScale} = scales
    let body = container.append("g")
        .style("transform",
            `translate(${margin.left}px,${margin.top}px)`
        )

    let bars = body.selectAll(".bar")
        .data(sectors)

    bars.enter().append("rect")
        .attr("height", yScale.bandwidth())
        .attr("y", (d) => yScale(d.sector))
        .attr("fill", "#2a5599")
        .attr("width", (d) => xScale(d.latent_traffic))
        .on("mouseenter", function(d) {
           // call the drawRawChart function
           drawRawChartAll(d.sector, raw_config, key)
           d3.select(this).attr("fill", "#992a5b")
//           showTooltip(d.latent_traffic, [d3.event.clientX, d3.event.clientY])
        })
        .on("mousemove", d => {
//            showTooltip(d.latent_traffic, [d3.event.clientX, d3.event.clientY])
        })
        .on("mouseleave", function(d) {
           // call the drawRawChart function
           removeRawChart(rawChartID);
           d3.select(this).attr("fill", "#2a5599")
//           d3.select("#tooltip").style("display","none")
        })
}

function drawBarChartAxes(sectors, scales, config) {
    let {xScale, yScale} = scales;
    let {container, margin, height} = config;

    let axisX = d3.axisBottom(xScale)
                    .ticks(5)

    container.append("g")
        .style("transform",
            `translate(${margin.left}px,${height - margin.bottom}px)`
        )
        .call(axisX)

    let axisY = d3.axisLeft(yScale)

    container.append("g")
        .style("transform",
            `translate(${margin.left}px,${margin.top}px)`
        )
        .call(axisY)
}

function getRawChartConfig(chartID) {
    let width = 500;
    let height = 200;
    let margin = {
        top: 10,
        bottom: 50,
        left: 100,
        right: 10
    }

    let bodyHeight = height - margin.top - margin.bottom
    let bodyWidth = width - margin.left - margin.right

    let container = d3.select(chartID)
    container
        .attr("width", width)
        .attr("height", height)

    return { width, height, margin, bodyHeight, bodyWidth, container}
}

function drawRawChartAll(sector, config, key) {

    let raw = store[key][sector]
    // get scale
    scales = getRawChartScales(raw, config);

    // plot scatter
    drawScatter(raw, scales, config);

    // plot line
    drawLine(raw, scales, config);

    // plot vertical line
    drawVLine(raw, scales, config);

    // create axes
    drawBarChartAxes(raw, scales, config);
}

function getRawChartScales(raw, config) {

    let { bodyWidth, bodyHeight} = config;
    let maxUser = raw.user_raw.reduce(function(a, b) {
        return Math.max(a, b);
    });

    let maxTraffic = raw.traffic_ideal.reduce(function(a, b) {
        return Math.max(a, b);
    });

    let xScale = d3.scaleLinear()
        .range([0,bodyWidth])
        .domain([0,maxUser]);

    let yScale = d3.scaleLinear()
        .range([bodyHeight, 0])
        .domain([0,maxTraffic]);

    return {xScale, yScale}
}

function drawScatter(raw, scales, config) {

    // convert data into d3 style
    raw_reformatted = []
    for (i=0 ; i < raw.user_raw.length; i++) {
        raw_reformatted.push({'user_raw':raw.user_raw[i], 'traffic_raw':raw.traffic_raw[i]})
    }

    let {margin, container} = config;
    let {xScale, yScale} = scales
    let body = container.append("g")
        .style("transform",
            `translate(${margin.left}px,${margin.top}px)`
        )
    let join = body.selectAll("circle")
        .data(raw_reformatted)

    let newelements = join.enter()
        .append("circle")
        .style("fill", "blue")
        .style("r", "5")

    join.merge(newelements)
        .transition()
        .attr("cx", d => xScale(+d.user_raw))
        .attr("cy", d => yScale(+d.traffic_raw))

    join.exit().remove()
}

function drawRawChartAxes(raw, scales, config) {
    let {xScale, yScale} = scales;
    let {container, margin, height} = config;

    let axisX = d3.axisBottom(xScale)
                    .ticks(5)

    container.append("g")
        .style("transform",
            `translate(${margin.left}px,${height - margin.bottom}px)`
        )
        .call(axisX)

    let axisY = d3.axisLeft(yScale)

    container.append("g")
        .style("transform",
            `translate(${margin.left}px,${margin.top}px)`
        )
        .call(axisY)
}

function removeRawChart(rawChartID) {
    d3.select(rawChartID).selectAll("*").remove();
}

function drawLine(raw, scales, config) {
    // convert data into d3 style
    raw_reformatted = []
    for (i=0 ; i < raw.user_ideal.length; i++) {
        raw_reformatted.push({'user_ideal':raw.user_ideal[i], 'traffic_ideal':raw.traffic_ideal[i]})
    }

    let {margin, container} = config;
    let {xScale, yScale} = scales
    let body = container.append("g")
        .style("transform",
            `translate(${margin.left}px,${margin.top}px)`
        )

    line = d3.line()
        .x(d => xScale(d.user_ideal))
        .y(d => yScale(d.traffic_ideal))
        .defined(d => !!d.traffic_ideal)

    body.append("path")
        .datum(raw_reformatted)
        .attr("d", line)
        .attr("class", "line")
        .transition()
}

function drawVLine(raw, scales, config) {
    // convert data into d3 style
    raw_reformatted = [{'user':raw.user_thd,'traffic':0},{'user':raw.user_thd,'traffic':scales.yScale.domain()[1]}]
    console.log(raw_reformatted)

    let {margin, container} = config;
    let {xScale, yScale} = scales
    let body = container.append("g")
        .style("transform",
            `translate(${margin.left}px,${margin.top}px)`
        )

    line = d3.line()
        .x(d => xScale(d.user))
        .y(d => yScale(d.traffic))
        .defined(d => !!d.user)

    body.append("path")
        .datum(raw_reformatted)
        .attr("d", line)
        .attr("class", "Vline")
        .transition()
}
function showTooltip(text, coords) {

    d3.select("#tooltip")
        .text(text)
        .style("top", coords[1])
        .style("left", coords[0])
        .style("display", "block")

}

function showDateText(text) {

    d3.select("#dateText").text("Updated on:" + text)
}

loadData().then(showData);