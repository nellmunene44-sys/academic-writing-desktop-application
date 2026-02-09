const roadmapSeed = [];

const categories = [
  "Facebook",
  "Telegram",
  "Reddit",
  "LinkedIn",
  "Website",
  "Outreach"
];

const weekTitles = [
  "Foundation & positioning",
  "Client acquisition systems",
  "Optimization & scaling",
  "Revenue consistency"
];

let day = 1;
for (let week = 1; week <= 4; week += 1) {
  for (let i = 0; i < 7; i += 1) {
    const category = categories[(day - 1) % categories.length];
    roadmapSeed.push({
      day,
      week,
      title: `Day ${day}: ${weekTitles[week - 1]}`,
      tasks: [
        {
          title: `Primary outreach on ${category}`,
          estimateMinutes: 90,
          category,
          outcome: "2 new qualified leads",
          important: true,
          completed: false,
          note: ""
        },
        {
          title: "Portfolio or proof update",
          estimateMinutes: 60,
          category: "Website",
          outcome: "One improved sample",
          important: false,
          completed: false,
          note: ""
        },
        {
          title: "Follow-up + CRM update",
          estimateMinutes: 45,
          category: "Outreach",
          outcome: "5 follow-ups sent",
          important: false,
          completed: false,
          note: ""
        }
      ]
    });
    day += 1;
  }
}

module.exports = roadmapSeed;
