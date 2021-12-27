import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { Server } from 'socket.io';
import IncludeList from './models/IncludeList.js';
import cors from 'cors';
import fs from 'fs';
import './database.js';

// ROUTES
import guidesRoutes from './routes/guides/guides.js';
import taskGuideInfoRoutes from './routes/task-guide-info/task-guide-info.js';

const app = express();
app.use(cors());
let httpServer = null;

if (process.env.NODE_ENV === 'development') {
    httpServer = createServer(app);
} else {
    const credentials = {
        key: fs.readFileSync(process.env.SSL_KEY_FILE_PATH),
        cert: fs.readFileSync(process.env.SSL_CERT_FILE_PATH),
        ca: fs.readFileSync(process.env.SSL_CHAIN_FILE_PATH),
    };
    httpServer = createHttpsServer(credentials, app);
}

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.use('/guides', guidesRoutes);
app.use('/task-guide-info', taskGuideInfoRoutes);

const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});

import includeListRoutes, { router as includeListRouter } from './routes/include-list/include-list.js';
includeListRoutes(io);

app.use('/include-list', includeListRouter);

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('global_action', ({ action = '' }) => {
        if (action === 'sum_earnings') {
            io.emit('global_action', { action: 'sum_earnings' });
        } else if (action === 'withdraw_earnings') {
            io.emit('global_action', { action: 'withdraw_earnings' });
        }
    });

    socket.on('sending_earnings', (data) => {
        console.log(data);
    });

    socket.on('reload_all', (task_name) => {
        io.emit('reload', task_name);
    });

    socket.on('fetch_all_earnings', () => {
        io.emit('fetch_earnings');
    });

    socket.on('sum_earnings', (earnings) => {
        io.emit('sum_earnings', earnings);
    });

    socket.on('fetch_include_list', async (callback) => {
        const includeList = await IncludeList.find({}, { __v: 0 });
        console.log(includeList);
        callback(includeList);
    });
});

app.use(express.static('public'));

httpServer.listen(process.env.PORT || 3000, () => {
    console.log('listening on ', process.env.PORT || 3000);
});
