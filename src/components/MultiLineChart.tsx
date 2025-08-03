/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { MultiDataPoint } from '../App';

type Props = {
  data: MultiDataPoint[];
};

export default function MultiLineChart({ data }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Define chart size and margins
  const margin = { top: 40, right: 30, bottom: 40, left: 50 };
  const width = 1100 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  // Initialize the SVG structure (only runs once on mount)
  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    // Remove previous chart group if any
    svg.selectAll('.chart-group').remove();

    // Create main group element and move it according to margin
    const g = svg
      .append('g')
      .attr('class', 'chart-group')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Append x and y axes groups
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`);
    g.append('g').attr('class', 'y-axis');
  }, []);

  // Draw the chart (runs when `data` changes)
  useEffect(() => {
    setIsLoading(false);
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>('.chart-group');
    if (g.empty()) return;

    // Get number of series (how many lines we need)
    const seriesCount = data[0][1].length;

    // Transform data into series-wise arrays for easier line drawing
    const seriesData = Array.from({ length: seriesCount }, (_, i) =>
      data
        .map((d) => [d[0], d[1][i]] as [number, number | null])
        .filter((d) => d[1] !== null)
    );

    // Extract all timestamps and values for scaling
    const allTimestamps = data.map((d) => d[0]);
    const allValues = seriesData.flat().map((d) => d[1]!) as number[];

    // Create x and y scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(allTimestamps) as [number, number])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(allValues) as [number, number])
      .nice()
      .range([height, 0]);

    // Draw x and y axes
    g.select<SVGGElement>('.x-axis').call(
      d3.axisBottom(xScale).ticks(10).tickFormat(d3.format('.0f'))
    );
    g.select<SVGGElement>('.y-axis').call(
      d3.axisLeft(yScale).ticks(10)
    );

    // Remove previous paths, dots, and legends to avoid overlap
    g.selectAll('.line-path').remove();
    g.selectAll('.dot').remove();
    svg.selectAll('.legend-group').remove();

    // Create a color scale to assign a different color to each line
    const colorScale = d3
      .scaleOrdinal(['#e74c3c', '#3498db', '#2ecc71'])
      .domain(d3.range(seriesCount).map(String)); // e.g., ["0", "1", "2", ...]

    const tooltip = d3.select(tooltipRef.current);

    // Draw each series line and its dots
    seriesData.forEach((serie, i) => {
      const line = d3
        .line<[number, number | null]>()
        .x((d) => xScale(d[0]))
        .y((d) => yScale(d[1]!));

      // Draw the line path
      g.append('path')
        .datum(serie)
        .attr('class', 'line-path')
        .attr('fill', 'none')
        .attr('stroke', colorScale(String(i))) // Use color for this series
        .attr('stroke-width', 2)
        .attr('d', line);

      // Draw circle dots for data points
      g.selectAll(`.dot-${i}`)
        .data(serie)
        .enter()
        .append('circle')
        .attr('class', `dot dot-${i}`)
        .attr('cx', (d) => xScale(d[0]))
        .attr('cy', (d) => yScale(d[1]!))
        .attr('r', 4)
        .attr('fill', colorScale(String(i))) // Same color as line

        // Tooltip events
        .on('mouseover', (event, d) => {
          const containerRect =
            svgRef.current?.getBoundingClientRect();
          if (!containerRect) return;

          tooltip
            .style('display', 'block')
            .style(
              'left',
              `${event.clientX - containerRect.left + 10}px`
            )
            .style(
              'top',
              `${event.clientY - containerRect.top - 28}px`
            )
            .html(
              `<div style="font-size: 0.875rem;">
                 <strong>X:</strong> ${d[0]}<br/>
                 <strong>Y:</strong> ${d[1]}
               </div>`
            );
        })
        .on('mouseout', () => {
          tooltip.style('display', 'none');
        });
    });

    // Draw legend (color label for each line)
    const legend = svg
      .append('g')
      .attr('class', 'legend-group')
      .attr('transform', `translate(${margin.left},10)`);

    const legendItems = legend
      .selectAll('g')
      .data(d3.range(seriesCount))
      .enter()
      .append('g')
      .attr('transform', (_, i) => `translate(${i * 120}, 0)`);

    legendItems
      .append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', (d) => colorScale(String(d))); // Same color as line

    legendItems
      .append('text')
      .text((d) => `Series ${d + 1}`)
      .attr('x', 18)
      .attr('y', 10)
      .style('font-size', '12px');
  }, [data]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Optional loading UI */}
      {isLoading && (
        <div className="rounded-3xl w-[1100px] h-[500px] bg-gray-100 flex justify-center items-center">
          Loading ...
        </div>
      )}

      {/* Main chart SVG */}
      <svg ref={svgRef}></svg>

      {/* Tooltip div (positioned absolutely on hover) */}
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '5px 8px',
          borderRadius: '4px',
          pointerEvents: 'none',
          display: 'none',
          fontSize: '0.75rem',
        }}
      ></div>
    </div>
  );
}
