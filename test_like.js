
const db = require('./backend/db');
async function run() {
  try {
    const q = 'SELECT id FROM likes_log WHERE tipo = \ AND item_id = \ AND ip = \ AND created_at >= NOW() - INTERVAL \'12 hours\'';
    const logCheck = await db.query(q, ['feiras', 1, '::1']);
    console.log(logCheck.rows);
  } catch (err) {
    console.error(err.message);
  }
  process.exit(0);
}
run();

