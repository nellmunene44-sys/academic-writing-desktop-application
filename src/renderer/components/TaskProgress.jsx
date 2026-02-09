import React, { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

export default function TaskProgress({ series }) {
  const chartRef = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !series.length) return;
    if (instance.current) instance.current.destroy();

    const data = [
      series.map((point) => point.day),
      series.map((point) => point.completed),
      series.map((point) => point.planned)
    ];

    instance.current = new uPlot({
      width: 520,
      height: 220,
      series: [
        { label: "Day" },
        { label: "Completed", stroke: "#34d399", width: 2 },
        { label: "Planned", stroke: "#f59e0b", width: 2 }
      ]
    }, data, chartRef.current);
  }, [series]);

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4">
      <h4 className="text-sm uppercase tracking-wide text-slate-400 mb-2">Tasks completed vs planned</h4>
      {series.length === 0 ? (
        <div className="text-sm text-slate-500">No task data yet.</div>
      ) : (
        <div ref={chartRef} />
      )}
    </div>
  );
}
