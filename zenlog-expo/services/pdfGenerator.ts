import { WeeklySummaryReport } from "./weeklyCoach";

/**
 * Generates print-ready minimalist HTML code representing the weekly coach report
 * fit for expo sharing triggers and PDF document printers
 */
export function generateWeeklyReportHtml(
  report: WeeklySummaryReport,
  userName: string,
  userGoal: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>ZenLog Weekly AI Coach Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #ffffff;
          color: #111827;
          margin: 0;
          padding: 40px;
          line-height: 1.6;
        }
        .header {
          border-bottom: 2px solid #111827;
          padding-bottom: 20px;
          margin-bottom: 40px;
        }
        .brand {
          font-size: 24px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .meta {
          font-size: 11px;
          color: #6b7280;
          margin-top: 5px;
          text-transform: uppercase;
          font-weight: bold;
        }
        .title {
          font-size: 28px;
          font-weight: 800;
          margin: 30px 0 10px 0;
        }
        .goal-badge {
          display: inline-block;
          background-color: #f3f4f6;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .grid {
          display: grid;
          grid-template-cols: repeat(3, 1fr);
          gap: 20px;
          margin: 40px 0;
        }
        .card {
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 20px;
          text-align: left;
        }
        .card-title {
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 10px;
        }
        .card-value {
          font-size: 24px;
          font-weight: 800;
        }
        .recommendation {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 30px;
          margin-top: 40px;
        }
        .rec-header {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #14b8a6;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        }
        .rec-text {
          font-size: 14px;
          font-weight: bold;
          color: #374151;
        }
        .footer {
          margin-top: 80px;
          border-t: 1px solid #f3f4f6;
          padding-top: 20px;
          text-align: center;
          font-size: 10px;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <span class="brand">🍎 ZenLog</span>
        <div class="meta">AI Powered Nutrition Assessment • Sunday Coach Reports</div>
      </div>

      <h1 class="title">Weekly Summary Report</h1>
      <span class="goal-badge">Goal: ${userGoal.toUpperCase()}</span>

      <div class="grid">
        <div class="card">
          <div class="card-title">Weight Change</div>
          <div class="card-value">${report.weightChangeKg > 0 ? `+${report.weightChangeKg}` : report.weightChangeKg} kg</div>
        </div>
        <div class="card">
          <div class="card-title">Average Calories</div>
          <div class="card-value">${report.averageCalories} kcal</div>
        </div>
        <div class="card">
          <div class="card-title">Protein Target Met</div>
          <div class="card-value">${report.proteinGoalAchievedDays} / ${report.proteinGoalTotalDays} Days</div>
        </div>
      </div>

      <div class="recommendation">
        <div class="rec-header">🌱 Gemini 2.5 Coach Insights</div>
        <div class="rec-text">
          "${report.aiCoachRecommendation}"
        </div>
      </div>

      <div class="footer">
        Generated on ${report.generatedDate} for ${userName}. All rights reserved ZenLog AI.
      </div>
    </body>
    </html>
  `;
}
