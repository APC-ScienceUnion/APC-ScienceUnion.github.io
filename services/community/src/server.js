import http from 'node:http';
import { readConfig } from './config.js';
import { createMailer } from './mail.js';
import { createApp } from './app.js';

const config = readConfig();
const app = await createApp(config, { sendMail: await createMailer(config) });
const server = http.createServer({ requestTimeout: 20000, headersTimeout: 10000, maxHeaderSize: 8192 }, app.handler);
server.listen(config.port, config.host, () => console.log(`Community API listening on ${config.host}:${config.port}`));
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(() => { app.close(); process.exit(0); }));
