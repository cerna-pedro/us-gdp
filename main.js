"use strict";

const dataURL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

const summonData = async url => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

const drawChart = async () => {
  const tooltip = d3.select("body").append("div").attr("id", "tooltip").style("opacity", 0);
  const {
    data
  } = await summonData(dataURL);
  let increment = 1;
  let quarter = 'Q';
  let prevYear = 0;

  for (const row of data) {
    const year = +row[0].split('-')[0];
    const dataDate = new Date(row[0]);
    row[4] = row[0];

    if (prevYear === year) {
      increment++;
    } else {
      increment = 1;
    }

    row[0] = year.toString();
    row[2] = quarter + increment;
    prevYear = year;
    row[3] = dataDate;
  }

  const margin = {
    top: 50,
    bottom: 120,
    left: 50,
    right: 50
  };
  const width = window.innerWidth;
  const height = window.innerHeight - 80;
  const svg = d3.select('#container').append('svg').attr('height', height - margin.top - margin.bottom).attr('width', width - margin.left - margin.right).attr('viewBox', [0, 0, width, height]);
  const barWidth = d3.scaleBand().domain(d3.range(data.length)).range([margin.left, width - margin.right]).padding(0.1);
  const x = d3.scaleTime().domain([d3.min(data)[3], d3.max(data)[3]]).range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain([0, d3.max(data)[1]]).range([height - margin.bottom, margin.top]);
  svg.append('g').attr('fill', 'steelblue').selectAll('rect').data(data).join('rect').attr('x', (d, i) => x(d[3])).attr('y', d => y(d[1])).attr('height', d => y(0) - y(d[1])).attr('width', barWidth.bandwidth()).attr('data-date', d => `${d[4]}`).attr('data-gdp', d => `${d[1]}`).attr('data-quarter', d => `${d[2]}`).attr('class', 'bar').on("mouseover pointerover pointerenter pointerdown pointermove gotpointercapture", e => {
    tooltip.transition().duration(200).style("opacity", .9);
    tooltip.html(`<h5>Year: ${e.target.dataset.date.split('-')[0]} ${e.target.dataset.quarter}</h5>\n <h6>GDP: $${new Intl.NumberFormat().format(e.target.dataset.gdp)} Billion</h6>`).attr('data-date', `${e.target.dataset.date}`).style("position", 'absolute').style("left", e.clientX - 80 + "px").style("top", e.clientY - 90 + "px");
  }).on("mouseout pointerout pointerup pointercancel pointerleave lostpointercapture", () => {
    tooltip.transition().duration(500).style("opacity", 0);
  });

  const xAxis = g => {
    g.attr('id', 'x-axis').attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x)).append('text').attr('fill', 'rgb(221, 221, 221)').text('Year').style('font-size', '1.5rem').attr('x', width / 2).attr('y', 50);
  };

  const yAxis = g => {
    g.attr('id', 'y-axis').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(null, data.format)).append('text').attr('fill', 'rgb(221, 221, 221)').text('GDP (Billions)').style('font-size', '1.5rem').attr('x', 0).attr('y', height / 2).attr('class', 'axis-title').attr("dy", 30).attr("dx", height / 4);
  };

  svg.append('g').call(xAxis);
  svg.append('g').call(yAxis);
  svg.node();
};

drawChart();