const express = require('express');
const router = express.Router(); 
const path = require('path');
const app = express();
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const authMiddleware = require('./middlewares/auth');
const cookieParser = require('cookie-parser');
// const csrf = require('csurf');
require('dotenv').config();

// 🚀 Activa trust proxy para Render y proxies inversos
app.set('trust proxy', 1); // Necesario para express-rate-limit y Render

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/layout'); 

// Middlewares básicos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Configuración de sesión
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, 
    httpOnly: true
  }
}));

// Flash messages
app.use(flash());

// Variables globales
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.session.user || null;
  res.locals.usuario = req.session.user || null;
  next();
});

// Autenticación
app.use(authMiddleware.setUser);

// CORS seguro
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Rutas
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const clientesRoutes = require('./routes/clientes');
const prestamosRoutes = require('./routes/prestamos');
const cobradoresRoutes = require('./routes/cobradores');
const rutasRoutes = require('./routes/rutas');
const reportesRoutes = require('./routes/reportes');

app.use('/auth', authRoutes);
app.use('/dashboard', authMiddleware.ensureAuthenticated, dashboardRoutes);
app.use('/clientes', authMiddleware.ensureAuthenticated, clientesRoutes);
app.use('/prestamos', authMiddleware.ensureAuthenticated, prestamosRoutes);
app.use('/reportes', authMiddleware.ensureAuthenticated, reportesRoutes);
app.use('/cobradores', authMiddleware.ensureAuthenticated, cobradoresRoutes);
app.use('/rutas', authMiddleware.ensureAuthenticated, rutasRoutes);

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.status || 500;
  if (req.accepts('html')) {
    res.status(statusCode).render('error', {
      title: 'Error',
      message: err.message || 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err : null
    });
  } else {
    res.status(statusCode).json({
      error: {
        message: err.message || 'Error interno del servidor'
      }
    });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Exportar app para pruebas

