const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { Emitter } = require('@socket.io/redis-emitter');
const { getRawClient } = require('./redisClient');
const logger = require('../utils/logger');

let io = null;
let emitter = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  const { isRedisConnected } = require('./redisClient');
  const pubClient = getRawClient();
  if (pubClient && isRedisConnected()) {
    const subClient = pubClient.duplicate();
    subClient.connect().then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      logger.info('Socket.IO Redis adapter configured.');
    }).catch(err => {
      logger.error(`Failed to connect Redis subClient for Socket.IO: ${err.message}`);
    });
  }

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Room management for specific parking location
    socket.on('join_parking', (parkingId) => {
      if (parkingId) {
        const room = `parking:${parkingId}`;
        socket.join(room);
        logger.info(`Socket ${socket.id} joined room ${room}`);
      }
    });

    socket.on('leave_parking', (parkingId) => {
      if (parkingId) {
        const room = `parking:${parkingId}`;
        socket.leave(room);
        logger.info(`Socket ${socket.id} left room ${room}`);
      }
    });

    // Admin dashboard room
    socket.on('join_admin', () => {
      socket.join('admin_dashboard');
      logger.info(`Socket ${socket.id} joined admin_dashboard room`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const initEmitter = () => {
  const pubClient = getRawClient();
  if (pubClient) {
    emitter = new Emitter(pubClient);
    logger.info('Socket.IO Redis Emitter configured for worker.');
  } else {
    logger.warn('Redis client not available, Socket.IO Emitter not configured.');
  }
};

const getIO = () => {
  if (!io) {
    logger.warn('Socket.io instance requested before initialization');
  }
  return io;
};

// Helper methods to emit real-time events
const notifySlotUpdate = (parkingId, slotData) => {
  const target = io || emitter;
  if (!target) return;
  const room = `parking:${parkingId}`;
  target.to(room).emit('slot:updated', slotData);
  target.to('admin_dashboard').emit('slot:updated', { parkingId, ...slotData });
};

const notifyBookingEvent = (eventType, bookingData) => {
  const target = io || emitter;
  if (!target) return;
  const parkingId = bookingData.locationId || bookingData.parkingLocationId;
  if (parkingId) {
    target.to(`parking:${parkingId}`).emit(`booking:${eventType}`, bookingData);
  }
  target.to('admin_dashboard').emit(`booking:${eventType}`, bookingData);
};

module.exports = {
  initSocket,
  initEmitter,
  getIO,
  notifySlotUpdate,
  notifyBookingEvent
};
