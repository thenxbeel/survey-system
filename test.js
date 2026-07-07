const http = require('http');

const data = JSON.stringify({
  identifier: 'admin@nps.local',
  password: 'Admin@123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Login Response:', body);
    const cookies = res.headers['set-cookie'];
    if (cookies) {
      const tokenCookie = cookies.find(c => c.startsWith('token='));
      if (tokenCookie) {
        const token = tokenCookie.split(';')[0].split('=')[1];
        console.log('Token:', token);
        
        http.get('http://localhost:3000/api/auth/me', {
          headers: { 'Cookie': `token=${token}` }
        }, res2 => {
          let body2 = '';
          res2.on('data', d => body2 += d);
          res2.on('end', () => {
            console.log('Me Response:', body2);
          });
        });
      }
    }
  });
});

req.write(data);
req.end();
