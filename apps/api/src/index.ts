import { createApp } from './app.js';
import { config } from './config.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`[api] Rapid Fat Loss Workbook API listening on :${config.port}`);
  console.log(`[api] env=${config.env}`);
});
