import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import './database.js';

// ROUTES
import guidesRoutes from './routes/guides/guides.js';

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/guides', guidesRoutes);

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
});

httpServer.listen(3000, '127.0.0.1', () => {
  console.log('listening on *:3000');
});
