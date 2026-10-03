const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth.routes');
const memberRoutes = require('./routes/member.routes');
const membershipRoutes = require('./routes/membership.routes');
const eventRoutes = require('./routes/event.routes');
const ticketRoutes = require('./routes/ticket.routes');
const announcementRoutes = require('./routes/announcement.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const initiativeRoutes = require('./routes/initiative.routes');
const taskRoutes = require('./routes/task.routes');
const expenseRoutes = require('./routes/expense.routes');
const financeRoutes = require('./routes/finance.routes');

const app = express();

// ── Security & Utility Middleware ────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static Files (uploads) ────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Health Check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CampusHub API is running', timestamp: new Date() });
});

// ── API Routes ─────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/members`, memberRoutes);
app.use(`${API}/memberships`, membershipRoutes);
app.use(`${API}/events`, eventRoutes);
app.use(`${API}/tickets`, ticketRoutes);
app.use(`${API}/announcements`, announcementRoutes);
app.use(`${API}/products`, productRoutes);
app.use(`${API}/orders`, orderRoutes);
app.use(`${API}/initiatives`, initiativeRoutes);
app.use(`${API}/tasks`, taskRoutes);
app.use(`${API}/expenses`, expenseRoutes);
app.use(`${API}/finance`, financeRoutes);

// ── Error Handling ─────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
