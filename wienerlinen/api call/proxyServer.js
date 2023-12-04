const cors_proxy = require('cors-anywhere');

const host = '0.0.0.0';
const port = 8080;

cors_proxy.createServer({
  originWhitelist: [], // Allow all origins
  requireHeaders: [], // Do not require any headers
  removeHeaders: ['cookie', 'cookie2'], // Remove cookie headers
}).listen(port, host, () => {
  console.log(`CORS Anywhere is running on ${host}:${port}`);
});
