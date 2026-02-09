import React, { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

export default function IncomeSparkline({ series, goal }) {
  const chartRef = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !series.length) return;
    if (instance.current) instance.current.destroy();

    const data = [
      series.map((point) => point.day),
      series.map((point) => point.total),
      series.map(() => goal)
    ];

    instance.current = new uPlot({
      width: 520,
      height: 180,
      series: [
        { label: "Day" },
        { label: "Income", stroke: "#f59e0b", width: 2 },
        { label: "Goal", stroke: "#94a3b8", width: 1, dash: [6, 6] }
      ],
      axes: [
        { show: false },
        { show: true, stroke: "#475569" }
      ]
    }, data, chartRef.current);
  }, [series, goal]);

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4">
      <h4 className="text-sm uppercase tracking-wide text-slate-400 mb-2">Income trajectory (30 days)</h4>
      {series.length === 0 ? (
        <div className="text-sm text-slate-500">No income data yet.</div>
      ) : (
        <div ref={chartRef} />
      )}
    </div>
  );
}
