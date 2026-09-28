const db = require('./backend/db');
db.query('SELECT * FROM users WHERE tipo=\'admin\'').then(res => { console.log(res.rows); process.exit(0); });
