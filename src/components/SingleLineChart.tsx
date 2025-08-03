/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { SingleDataPoint } from '../App';

type Props = {
  data: SingleDataPoint[];
};

export default function SingleLineChart({ data }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Chart margin and dimensions
  const margin = { top: 40, right: 30, bottom: 40, left: 50 };
  const width = 1100 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Initialize the SVG and basic structure only once
  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    // Remove any existing <g> element before re-adding (avoid overlaps)
    svg.select('g').remove();

    // Create a <g> container for chart content with margin applied
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Append x and y axes groups
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`);
    g.append('g').attr('class', 'y-axis');
  }, [isLoading]);

  // Draw chart whenever `data` changes
  useEffect(() => {
    setIsLoading(false);
    if (!data || data.length === 0) return;

    // Filter out null values
    const filteredData = data.filter((d) => d[1] !== null);

    const svg = d3.select(svgRef.current);
    const g = svg.select('g');

    // Define x and y scales based on data extent
    const xScale = d3
      .scaleLinear()
      .domain(
        d3.extent(filteredData, (d) => d[0]) as [number, number]
      )
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain(
        d3.extent(filteredData, (d) => d[1] as number) as [
          number,
          number
        ]
      )
      .nice()
      .range([height, 0]);

    // Draw or update axes
    g.select<SVGGElement>('.x-axis').call(
      d3.axisBottom(xScale).ticks(10).tickFormat(d3.format('.0f'))
    );
    g.select<SVGGElement>('.y-axis').call(
      d3.axisLeft(yScale).ticks(10)
    );

    // Remove old paths, dots, and legend to avoid duplication
    g.selectAll('.line-path').remove();
    g.selectAll('.dot').remove();
    g.selectAll('.legend').remove();

    // Line generator function
    const lineGenerator = d3
      .line<SingleDataPoint>()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1] as number));

    // Draw the line
    g.append('path')
      .datum(filteredData)
      .attr('class', 'line-path')
      .attr('fill', 'none')
      .attr('stroke', '#999')
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);

    const tooltip = d3.select(tooltipRef.current);

    // Draw dots and attach tooltip interactions
    g.selectAll('.dot')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d[0]))
      .attr('cy', (d) => yScale(d[1] as number))
      .attr('r', 4)
      .attr('fill', '#3498db')
      .on('mouseover', (event, d) => {
        const containerRect = svgRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        tooltip
          .style('display', 'block')
          .style(
            'left',
            `${event.clientX - containerRect.left + 10}px`
          )
          .style('top', `${event.clientY - containerRect.top - 28}px`)
          .html(
            `<div style="font-size: 0.875rem;">
              <strong>x:</strong> ${d[0]}<br/>
              <strong>y:</strong> ${d[1]}
            </div>`
          );
      })
      .on('mouseout', () => {
        tooltip.style('display', 'none');
      });

    // Draw legend
    g.append('rect')
      .attr('class', 'legend')
      .attr('x', width - 90)
      .attr('y', -30)
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', 'steelblue');

    g.append('text')
      .attr('class', 'legend')
      .attr('x', width - 75)
      .attr('y', -21)
      .attr('font-size', '0.8rem')
      .text('Single Series');
  }, [data, isLoading]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Show loader while initializing */}
      {isLoading ? (
        <div className="rounded-3xl w-[1100px] h-[500px] bg-gray-100 flex justify-center items-center">
          Loading ...
        </div>
      ) : (
        <>
          {/* Chart container */}
          <svg ref={svgRef}></svg>

          {/* Custom tooltip */}
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
        </>
      )}
    </div>
  );
}
