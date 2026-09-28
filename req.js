const http = require('http');
http.get('http://localhost:3001/api/admin/estatisticas', res => { console.log(res.statusCode); process.exit(); });
