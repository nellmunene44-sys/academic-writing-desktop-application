import React, { useEffect, useState } from "react";

const platformOptions = ["Facebook", "Telegram", "Reddit", "LinkedIn", "Website", "Outreach"];

export default function Onboarding({ onSave, initialProfile }) {
  const [form, setForm] = useState({
    skillLevel: "intermediate",
    subjects: "",
    targetIncome: 1000,
    dailyHours: 6,
    primaryPlatforms: ["Facebook", "LinkedIn"],
    pricingRange: "",
    idealClient: "",
    successMetric: ""
  });

  useEffect(() => {
    if (!initialProfile) return;
    setForm((prev) => ({
      ...prev,
      ...initialProfile
    }));
  }, [initialProfile]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const togglePlatform = (platform) => {
    setForm((prev) => {
      const exists = prev.primaryPlatforms.includes(platform);
      return {
        ...prev,
        primaryPlatforms: exists
          ? prev.primaryPlatforms.filter((item) => item !== platform)
          : [...prev.primaryPlatforms, platform]
      };
    });
  };

  return (
    <div className="bg-slate-900/70 p-8 rounded-2xl shadow-xl max-w-2xl">
      <h2 className="text-2xl font-semibold text-amber-200 mb-4">Quick onboarding</h2>
      <p className="text-slate-300 mb-6">
        This data stays local and tunes the 30-day roadmap for your workflow.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-sm">
          Skill level
          <select
            value={form.skillLevel}
            onChange={(event) => update("skillLevel", event.target.value)}
            className="bg-slate-800/60 rounded-lg px-3 py-2"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Daily available hours
          <input
            type="number"
            min="1"
            max="12"
            value={form.dailyHours}
            onChange={(event) => update("dailyHours", Number(event.target.value))}
            className="bg-slate-800/60 rounded-lg px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm col-span-2">
          Subjects handled
          <input
            value={form.subjects}
            onChange={(event) => update("subjects", event.target.value)}
            placeholder="e.g., Nursing, Business, Education"
            className="bg-slate-800/60 rounded-lg px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Target monthly income (USD)
          <input
            type="number"
            min="100"
            value={form.targetIncome}
            onChange={(event) => update("targetIncome", Number(event.target.value))}
            className="bg-slate-800/60 rounded-lg px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Pricing range (per project)
          <input
            value={form.pricingRange}
            onChange={(event) => update("pricingRange", event.target.value)}
            placeholder="e.g., $200–$500"
            className="bg-slate-800/60 rounded-lg px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm col-span-2">
          Ideal client type
          <input
            value={form.idealClient}
            onChange={(event) => update("idealClient", event.target.value)}
            placeholder="e.g., Master’s students in Nursing"
            className="bg-slate-800/60 rounded-lg px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm col-span-2">
          Success metric for the month
          <input
            value={form.successMetric}
            onChange={(event) => update("successMetric", event.target.value)}
            placeholder="e.g., 5 repeat clients or $1,000 earned"
            className="bg-slate-800/60 rounded-lg px-3 py-2"
          />
        </label>
      </div>

      <div className="mt-4">
        <div className="text-sm text-slate-300 mb-2">Primary platforms</div>
        <div className="flex flex-wrap gap-2">
          {platformOptions.map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => togglePlatform(platform)}
              className={`px-3 py-2 rounded-xl text-xs ${
                form.primaryPlatforms.includes(platform)
                  ? "bg-amber-500/30 text-amber-100"
                  : "bg-slate-800/60 text-slate-300"
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSave(form)}
        className="mt-6 px-4 py-3 rounded-xl bg-amber-500/30 text-amber-100 hover:bg-amber-500/50"
      >
        Save and continue to dashboard
      </button>
    </div>
  );
}
