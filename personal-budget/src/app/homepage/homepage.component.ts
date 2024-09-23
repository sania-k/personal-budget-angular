import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import * as d3 from 'd3';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements AfterViewInit {

  constructor(private http: HttpClient) { }
  private _current: any = {};

  public dataSource = {
    labels: [] as string[],
    datasets: [{
      data: [] as number[],
      backgroundColor: ['SteelBlue', 'LightSkyBlue', 'CadetBlue', 'CornflowerBlue', 'DarkSlateBlue', 'MidnightBlue', 'PaleTurquoise']
    }]
  };

  ngAfterViewInit(): void {
    this.http.get('http://localhost:3456/budget')
      .subscribe((res: any) => {
        for (let i = 0; i < res.budget.length; i++) {
          this.dataSource.datasets[0].data[i] = res.budget[i].budget;
          this.dataSource.labels[i] = res.budget[i].title;
        }
        this.createChartJs();
        this.createD3Chart();
      });
  }

  // Chart.js pie chart
  createChartJs() {
    Chart.register(PieController, ArcElement, Tooltip, Legend);

    const chartElement = document.getElementById("chartjsChart") as HTMLCanvasElement | null;

    if (chartElement) {
      const ctx = chartElement.getContext("2d");

      if (ctx) {
        new Chart(ctx, {
          type: 'pie',
          data: this.dataSource
        });
      }
    }
  }

  // D3.js pie chart
  createD3Chart() {
    const svg = d3.select("#d3Chart")
      .append("svg")
      .attr("width", 340)
      .attr("height", 450)
      .append("g")
      .attr("transform", `translate(170,225)`); // Center the chart

    svg.append("g").attr("class", "slices");
    svg.append("g").attr("class", "labels");
    svg.append("g").attr("class", "lines");

    const width = 340, height = 450;
    const radius = Math.min(width, height) / 4;

    const pie = d3.pie<any>()
      .sort(null)
      .value((d: any) => d.value);

    const arc = d3.arc()
      .outerRadius(radius * 0.8)
      .innerRadius(radius * 0.4);

    const outerArc = d3.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    const color = d3.scaleOrdinal()
      .domain(this.dataSource.labels)
      .range(d3.schemeCategory10);

    const data = this.dataSource.labels.map((label, i) => ({
      label,
      value: this.dataSource.datasets[0].data[i]
    }));

    this.updateD3Chart(data, svg, pie, arc, outerArc, radius, color);
  }

  updateD3Chart(data: any[], svg: any, pie: any, arc: any, outerArc: any, radius: number, color: any): void {
    const key = (d: any) => d.data.label;

    // Pie slices
    const slice = svg.select(".slices").selectAll("path.slice")
      .data(pie(data), key);

    slice.enter()
      .insert("path")
      .style("fill", (d: any) => color(d.data.label))
      .attr("class", "slice");

    slice.transition().duration(1000)
      .attrTween("d", (d: any) => {
        const interpolate = d3.interpolate(this._current || d, d);
        this._current = interpolate(0);
        return (t: any) => arc(interpolate(t));
      });

    slice.exit().remove();

    // Text labels
    const text = svg.select(".labels").selectAll("text")
      .data(pie(data), key);

    text.enter()
      .append("text")
      .attr("dy", ".35em")
      .text((d: any) => d.data.label);

    text.transition().duration(1000)
      .attrTween("transform", (d: any) => {
        const interpolate = d3.interpolate(this._current || d, d);
        this._current = interpolate(0);
        return (t: any) => {
          const d2 = interpolate(t);
          const pos = outerArc.centroid(d2);
          pos[0] = radius * (this.midAngle(d2) < Math.PI ? 1 : -1);
          return `translate(${pos})`;
        };
      })
      .styleTween("text-anchor", (d: any) => {
        const interpolate = d3.interpolate(this._current || d, d);
        this._current = interpolate(0);
        return (t: any) => this.midAngle(interpolate(t)) < Math.PI ? "start" : "end";
      });

    text.exit().remove();

    // Slice to text polylines
    const polyline = svg.select(".lines").selectAll("polyline")
      .data(pie(data), key);

    polyline.enter().append("polyline");

    polyline.transition().duration(1000)
      .attrTween("points", (d: any) => {
        const interpolate = d3.interpolate(this._current || d, d);
        this._current = interpolate(0);
        return (t: any) => {
          const d2 = interpolate(t);
          const pos = outerArc.centroid(d2);
          pos[0] = radius * 0.95 * (this.midAngle(d2) < Math.PI ? 1 : -1);
          return [arc.centroid(d2), outerArc.centroid(d2), pos];
        };
      });

    polyline.exit().remove();
  }

  midAngle(d: any): number {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }
}
