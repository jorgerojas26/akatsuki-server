import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import './database.js';

// ROUTES
import guidesRoutes from './routes/guides/guides.js';
import taskGuideInfoRoutes from './routes/task-guide-info/task-guide-info.js';
import includeListRoutes from './routes/include-list/include-list.js';

const app = express();
const httpServer = createServer(app);

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.use('/guides', guidesRoutes);
app.use('/task-guide-info', taskGuideInfoRoutes);
app.use('/include-list', includeListRoutes);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

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
});

app.use(express.static('public'));

httpServer.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:3000');
});
