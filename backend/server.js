require('dotenv').config();

if (!process.env.GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY manquant dans .env !');
  process.exit(1);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./src/routes/auth.routes');
const profileRoutes = require('./src/routes/profile.routes');
const experienceRoutes = require('./src/routes/experience.routes');
const formationRoutes = require('./src/routes/formation.routes');
const skillRoutes = require('./src/routes/skill.routes');
const languageRoutes = require('./src/routes/language.routes');
const jobOfferRoutes = require('./src/routes/jobOffer.routes');
const aiRoutes = require('./src/routes/ai.routes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '8mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/formations', formationRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/job-offers', jobOfferRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CV Manager API running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connecté');
    app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
  })
  .catch(err => {
    console.error('Erreur MongoDB:', err);
    process.exit(1);
  });
