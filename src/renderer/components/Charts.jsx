import React, { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

function buildSeries(seriesLabel) {
  return [
    { label: "Day" },
    { label: seriesLabel, stroke: "#fbbf24", width: 2 }
  ];
}

export default function Charts({ incomeSeries }) {
  const chartRef = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (instance.current) instance.current.destroy();

    const data = [incomeSeries.map((point) => point.day), incomeSeries.map((point) => point.total)];
    instance.current = new uPlot({
      width: 520,
      height: 220,
      series: buildSeries("Income")
    }, data, chartRef.current);
  }, [incomeSeries]);

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4">
      <h4 className="text-sm uppercase tracking-wide text-slate-400 mb-2">Income over time</h4>
      <div ref={chartRef} />
    </div>
  );
}

