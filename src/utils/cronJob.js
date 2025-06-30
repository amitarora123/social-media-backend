// scheduler.js
const cron = require("node-cron");
const { query } = require("./database");

cron.schedule("* * * * *", async () => {
  const now = new Date();
  const publishQuery = `
    UPDATE posts
    SET is_published = true
    WHERE is_published = false AND scheduled_at <= $1
    RETURNING id
  `;
  const result = await query(publishQuery, [now]);
  if (result.rows.length > 0) {
    console.log(
      `[CRON] Published ${result.rows.length} scheduled post(s) at ${now}`
    );
  }
});
