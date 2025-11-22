const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');
const http = require('http');
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

// Database connection
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set!');
  console.error('On Render, make sure to:');
  console.error('1. Create a PostgreSQL database');
  console.error('2. Add DATABASE_URL to the web service environment variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize database
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        bio VARCHAR(500),
        status VARCHAR(50) DEFAULT 'offline',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Friends table
    await client.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, friend_id)
      );
    `);

    // Friend requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(from_user_id, to_user_id)
      );
    `);

    // Conversations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        is_group BOOLEAN DEFAULT FALSE,
        is_class_group BOOLEAN DEFAULT FALSE,
        period VARCHAR(100),
        subject VARCHAR(100),
        teacher VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Conversation participants
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversation_participants (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(conversation_id, user_id)
      );
    `);

    // Messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id),
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Message read receipts
    await client.query(`
      CREATE TABLE IF NOT EXISTS message_reads (
        id SERIAL PRIMARY KEY,
        message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(message_id, user_id)
      );
    `);

    client.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (username, password, display_name) VALUES ($1, $2, $3) RETURNING id, username, display_name',
      [username, hashedPassword, username]
    );
    
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);
    
    res.json({ token, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, display_name: user.display_name, bio: user.bio } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users/search', async (req, res) => {
  try {
    const { query } = req.query;
    const result = await pool.query(
      'SELECT id, username, display_name, status FROM users WHERE username ILIKE $1 LIMIT 20',
      [`%${query}%`]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/friends/request', async (req, res) => {
  try {
    const { toUserId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const result = await pool.query(
      'INSERT INTO friend_requests (from_user_id, to_user_id) VALUES ($1, $2) RETURNING *',
      [userId, toUserId]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/friends/accept', async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const request = await pool.query('SELECT * FROM friend_requests WHERE id = $1', [requestId]);
    const { from_user_id, to_user_id } = request.rows[0];
    
    // Create bidirectional friendship
    await pool.query('INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2)', [from_user_id, to_user_id]);
    await pool.query('INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2)', [to_user_id, from_user_id]);
    
    // Delete request
    await pool.query('DELETE FROM friend_requests WHERE id = $1', [requestId]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user_online', (data) => {
    io.emit('user_status_changed', { userId: data.userId, status: 'online' });
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('user_typing', data);
  });

  socket.on('send_message', async (data) => {
    try {
      const result = await pool.query(
        'INSERT INTO messages (conversation_id, sender_id, text) VALUES ($1, $2, $3) RETURNING *',
        [data.conversationId, data.senderId, data.text]
      );
      
      io.emit('message_received', result.rows[0]);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Initialize and start server
initializeDatabase().then(() => {
  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
