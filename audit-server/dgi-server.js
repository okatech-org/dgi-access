#!/usr/bin/env node
/**
 * Serveur DGI Access Application
 * API complète pour gestion du personnel et visites DGI Gabon
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const LOG_DIR = process.env.LOG_DIR || './logs';
const DB_DIR = process.env.DB_DIR || './data';
const API_KEY = process.env.API_KEY || 'dev-dgi-key-123';

// Configuration du rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 200, // 200 requêtes
  duration: 60, // par minute
});

// Configuration de la base de données
let db;

// Middleware de sécurité
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['http://localhost:5173', 'https://access.dgi.ga', 'https://dgi-access.netlify.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Middleware d'authentification
const authenticateAPI = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({
      error: 'API key manquante ou invalide',
      code: 'UNAUTHORIZED'
    });
  }
  
  next();
};

// Middleware de rate limiting
const rateLimitMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Trop de requêtes',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 1,
    });
  }
};

// Initialisation de la base de données
async function initDatabase() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    
    const dbPath = path.join(DB_DIR, 'dgi.db');
    db = new Database(dbPath);
    
    // Activer les clés étrangères
    db.pragma('foreign_keys = ON');
    
    // Créer les tables
    createTables();
    
    // Insérer les données initiales
    await seedData();
    
    console.log('✅ Base de données initialisée:', dbPath);
  } catch (error) {
    console.error('❌ Erreur initialisation BDD:', error);
    process.exit(1);
  }
}

function createTables() {
  // Table des services
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      sigle TEXT,
      type TEXT NOT NULL,
      parent_id TEXT,
      responsable_id TEXT,
      mission TEXT,
      localisation TEXT,
      province TEXT,
      certification TEXT,
      creation_date TEXT,
      effectif_total INTEGER,
      budget_annuel INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES services(id)
    )
  `);

  // Table du personnel
  db.exec(`
    CREATE TABLE IF NOT EXISTS personnel (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      fonction TEXT NOT NULL,
      grade TEXT,
      service TEXT NOT NULL,
      direction TEXT NOT NULL,
      niveau_hierarchique INTEGER NOT NULL,
      statut TEXT NOT NULL DEFAULT 'actif',
      date_nomination TEXT,
      formation TEXT,
      specialisation TEXT,
      contact_telephone TEXT,
      contact_email TEXT,
      contact_bureau TEXT,
      photo TEXT,
      biographie TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table de l'historique des postes
  db.exec(`
    CREATE TABLE IF NOT EXISTS historique_postes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      personnel_id TEXT NOT NULL,
      poste TEXT NOT NULL,
      service TEXT NOT NULL,
      date_debut TEXT NOT NULL,
      date_fin TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (personnel_id) REFERENCES personnel(id)
    )
  `);

  // Table des visites
  db.exec(`
    CREATE TABLE IF NOT EXISTS visites (
      id TEXT PRIMARY KEY,
      personnel_id TEXT NOT NULL,
      date_prevue TEXT NOT NULL,
      heure_prevue TEXT NOT NULL,
      duree_estimee INTEGER NOT NULL,
      objectif TEXT NOT NULL,
      type TEXT NOT NULL,
      statut TEXT NOT NULL DEFAULT 'planifiee',
      lieu TEXT NOT NULL,
      participants TEXT,
      documents_requis TEXT,
      notes_preparation TEXT,
      compte_rendu TEXT,
      createur_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (personnel_id) REFERENCES personnel(id)
    )
  `);

  // Index pour optimiser les requêtes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_personnel_service ON personnel(service);
    CREATE INDEX IF NOT EXISTS idx_personnel_statut ON personnel(statut);
    CREATE INDEX IF NOT EXISTS idx_personnel_niveau ON personnel(niveau_hierarchique);
    CREATE INDEX IF NOT EXISTS idx_visites_date ON visites(date_prevue);
    CREATE INDEX IF NOT EXISTS idx_visites_personnel ON visites(personnel_id);
    CREATE INDEX IF NOT EXISTS idx_historique_personnel ON historique_postes(personnel_id);
  `);
}

async function seedData() {
  // Vérifier si les données existent déjà
  const personnelCount = db.prepare('SELECT COUNT(*) as count FROM personnel').get();
  if (personnelCount.count > 0) {
    console.log('📊 Données DGI déjà présentes');
    return;
  }

  console.log('🌱 Initialisation des données DGI...');

  // Insérer les services
  const insertService = db.prepare(`
    INSERT INTO services (id, nom, sigle, type, parent_id, responsable_id, mission, localisation, creation_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const services = [
    ['dgi', 'Direction Générale des Impôts', 'DGI', 'direction_generale', null, null, 'Gestion, contrôle et recouvrement des impôts au Gabon', 'Libreville', '2002-12-18'],
    ['dge', 'Direction des Grandes Entreprises', 'DGE', 'direction', 'dgi', 'dir_001', 'Gestion fiscale des entreprises avec CA > 1,5 milliard FCFA', 'Libreville', null],
    ['dme', 'Direction des Moyennes Entreprises', 'DME', 'direction', 'dgi', 'dir_002', 'Gestion fiscale des moyennes entreprises', 'Libreville', null],
    ['dpe', 'Direction des Petites Entreprises', 'DPE', 'direction', 'dgi', 'dir_003', 'Gestion fiscale des petites entreprises et particuliers', 'Libreville', null],
    ['dr', 'Direction du Recouvrement', 'DR', 'direction', 'dgi', 'dir_004', 'Recouvrement des créances fiscales', 'Libreville', null],
    ['ic', 'Inspection Centrale', 'IC', 'service', 'dgi', 'insp_001', 'Contrôle et audit des services fiscaux', 'Libreville', null]
  ];

  const serviceTransaction = db.transaction(() => {
    services.forEach(service => insertService.run(...service));
  });
  serviceTransaction();

  // Insérer le personnel
  const insertPersonnel = db.prepare(`
    INSERT INTO personnel (
      id, nom, prenom, fonction, grade, service, direction, niveau_hierarchique, 
      statut, date_nomination, formation, specialisation, contact_telephone, 
      contact_email, contact_bureau, biographie
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const personnel = [
    ['dg_001', 'BOUMAH', 'Eric', 'Directeur Général', 'Inspecteur Central des Impôts', 'Direction Générale', 'Direction Générale des Impôts', 1, 'actif', '2023-09-28', 'École nationale des régies financières (ENAREF) - Burkina Faso', JSON.stringify(['Administration fiscale', 'Gestion publique']), '+241 01 XX XX XX', 'dg@impots.ga', 'DG - 1er étage', 'Ancien directeur provincial, nommé DG en septembre 2023'],
    ['dga_001', 'EYOUGA', 'Pamphile', 'Directeur Général Adjoint', null, 'Direction Générale', 'Direction Générale des Impôts', 2, 'actif', null, null, null, '+241 01 XX XX XX', null, 'DGA - 1er étage', null],
    ['dga_002', 'MINKO', 'Michel', 'Directeur Général Adjoint 1', null, 'Direction Générale', 'Direction Générale des Impôts', 2, 'actif', null, null, null, null, null, 'DGA1 - 1er étage', null],
    ['dir_001', 'NDJIBAH', 'Calixte', 'Directeur des Grandes Entreprises', 'Inspecteur des Impôts', 'Direction des Grandes Entreprises', 'Direction Générale des Impôts', 3, 'actif', null, 'Mastère en fiscalité', JSON.stringify(['Fiscalité des grandes entreprises', 'Contrôle fiscal']), '+241 01 XX XX XX', null, 'DGE - 2ème étage', null],
    ['insp_001', 'DJOUMBALOUMBOU', 'Muccia', 'Inspectrice Centrale', 'Inspectrice Centrale des Impôts', 'Inspection Centrale', 'Direction Générale des Impôts', 3, 'actif', null, null, JSON.stringify(['Audit fiscal', 'Contrôle et vérification']), null, null, 'IC - 3ème étage', null],
    ['dir_002', 'MBADINGA', 'Jean-Claude', 'Directeur des Moyennes Entreprises', null, 'Direction des Moyennes Entreprises', 'Direction Générale des Impôts', 3, 'actif', null, null, null, null, null, 'DME - 2ème étage', null],
    ['dir_003', 'ONDO', 'Marie-Claire', 'Directrice des Petites Entreprises', null, 'Direction des Petites Entreprises', 'Direction Générale des Impôts', 3, 'actif', null, null, null, null, null, 'DPE - 2ème étage', null],
    ['dir_004', 'NGOUEMA', 'Patrick', 'Directeur du Recouvrement', null, 'Direction du Recouvrement', 'Direction Générale des Impôts', 3, 'actif', null, null, null, null, null, 'DR - 1er étage', null]
  ];

  const personnelTransaction = db.transaction(() => {
    personnel.forEach(person => insertPersonnel.run(...person));
  });
  personnelTransaction();

  // Insérer l'historique pour Pamphile EYOUGA
  const insertHistorique = db.prepare(`
    INSERT INTO historique_postes (personnel_id, poste, service, date_debut, date_fin)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  insertHistorique.run('dga_001', 'Directeur des Régimes Spécifiques', 'Régimes Spécifiques', '2020-01-01', '2023-09-28');

  console.log('✅ Données DGI initialisées');
}

// Routes API DGI

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    uptime: process.uptime(),
    database: db ? 'connected' : 'disconnected'
  });
});

/**
 * Personnel - GET tous
 */
app.get('/api/dgi/personnel', rateLimitMiddleware, (req, res) => {
  try {
    const { search, service, statut, niveau_hierarchique } = req.query;
    
    let query = `
      SELECT p.*, 
      GROUP_CONCAT(hp.poste || ' (' || hp.date_debut || ' - ' || COALESCE(hp.date_fin, 'présent') || ')') as historique
      FROM personnel p
      LEFT JOIN historique_postes hp ON p.id = hp.personnel_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (p.nom LIKE ? OR p.prenom LIKE ? OR p.fonction LIKE ? OR p.service LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (service) {
      query += ` AND p.service LIKE ?`;
      params.push(`%${service}%`);
    }

    if (statut) {
      query += ` AND p.statut = ?`;
      params.push(statut);
    }

    if (niveau_hierarchique) {
      query += ` AND p.niveau_hierarchique = ?`;
      params.push(parseInt(niveau_hierarchique));
    }

    query += ` GROUP BY p.id ORDER BY p.niveau_hierarchique, p.nom`;

    const personnel = db.prepare(query).all(params);
    
    // Traiter les données pour le format attendu
    const personnelFormatted = personnel.map(p => ({
      ...p,
      specialisation: p.specialisation ? JSON.parse(p.specialisation) : null,
      contact: {
        telephone: p.contact_telephone,
        email: p.contact_email,
        bureau: p.contact_bureau
      },
      date_nomination: p.date_nomination ? new Date(p.date_nomination) : null,
      historique_postes: p.historique ? p.historique.split(',').map(h => {
        const match = h.match(/^(.+) \((.+) - (.+)\)$/);
        if (match) {
          return {
            poste: match[1],
            date_debut: new Date(match[2]),
            date_fin: match[3] !== 'présent' ? new Date(match[3]) : null
          };
        }
        return null;
      }).filter(Boolean) : []
    }));

    res.json(personnelFormatted);
  } catch (error) {
    console.error('Erreur récupération personnel:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

/**
 * Personnel - GET par ID
 */
app.get('/api/dgi/personnel/:id', rateLimitMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    
    const personnel = db.prepare(`
      SELECT * FROM personnel WHERE id = ?
    `).get(id);

    if (!personnel) {
      return res.status(404).json({ error: 'Personnel non trouvé' });
    }

    const historique = db.prepare(`
      SELECT * FROM historique_postes WHERE personnel_id = ? ORDER BY date_debut DESC
    `).all(id);

    const result = {
      ...personnel,
      specialisation: personnel.specialisation ? JSON.parse(personnel.specialisation) : null,
      contact: {
        telephone: personnel.contact_telephone,
        email: personnel.contact_email,
        bureau: personnel.contact_bureau
      },
      date_nomination: personnel.date_nomination ? new Date(personnel.date_nomination) : null,
      historique_postes: historique.map(h => ({
        poste: h.poste,
        service: h.service,
        date_debut: new Date(h.date_debut),
        date_fin: h.date_fin ? new Date(h.date_fin) : null
      }))
    };

    res.json(result);
  } catch (error) {
    console.error('Erreur récupération personnel:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

/**
 * Services - GET tous
 */
app.get('/api/dgi/services', rateLimitMiddleware, (req, res) => {
  try {
    const services = db.prepare(`
      SELECT * FROM services ORDER BY type, nom
    `).all();

    res.json(services);
  } catch (error) {
    console.error('Erreur récupération services:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

/**
 * Visites - GET toutes
 */
app.get('/api/dgi/visites', rateLimitMiddleware, (req, res) => {
  try {
    const { date, personnel_id } = req.query;
    
    let query = `
      SELECT v.*, p.nom, p.prenom, p.fonction 
      FROM visites v
      JOIN personnel p ON v.personnel_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      query += ` AND v.date_prevue = ?`;
      params.push(date);
    }

    if (personnel_id) {
      query += ` AND v.personnel_id = ?`;
      params.push(personnel_id);
    }

    query += ` ORDER BY v.date_prevue DESC, v.heure_prevue`;

    const visites = db.prepare(query).all(params);
    
    const visitesFormatted = visites.map(v => ({
      ...v,
      date_prevue: new Date(v.date_prevue),
      participants: v.participants ? JSON.parse(v.participants) : [],
      documents_requis: v.documents_requis ? JSON.parse(v.documents_requis) : []
    }));

    res.json(visitesFormatted);
  } catch (error) {
    console.error('Erreur récupération visites:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

/**
 * Visites - POST nouvelle
 */
app.post('/api/dgi/visites', rateLimitMiddleware, authenticateAPI, (req, res) => {
  try {
    const {
      personnel_id,
      date_prevue,
      heure_prevue,
      duree_estimee,
      objectif,
      type,
      lieu,
      participants = [],
      documents_requis = [],
      notes_preparation,
      createur_id
    } = req.body;

    const id = crypto.randomUUID ? crypto.randomUUID() : `visite_${Date.now()}`;

    const insert = db.prepare(`
      INSERT INTO visites (
        id, personnel_id, date_prevue, heure_prevue, duree_estimee,
        objectif, type, lieu, participants, documents_requis,
        notes_preparation, createur_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      id, personnel_id, date_prevue, heure_prevue, duree_estimee,
      objectif, type, lieu, JSON.stringify(participants), 
      JSON.stringify(documents_requis), notes_preparation, createur_id
    );

    if (result.changes > 0) {
      res.status(201).json({ id, message: 'Visite créée avec succès' });
    } else {
      res.status(400).json({ error: 'Erreur création visite' });
    }
  } catch (error) {
    console.error('Erreur création visite:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

/**
 * Statistiques
 */
app.get('/api/dgi/stats', rateLimitMiddleware, (req, res) => {
  try {
    const stats = {
      total_personnel: db.prepare('SELECT COUNT(*) as count FROM personnel').get().count,
      par_statut: {},
      par_niveau: {},
      par_service: {},
      total_services: db.prepare('SELECT COUNT(*) as count FROM services').get().count,
      total_visites: db.prepare('SELECT COUNT(*) as count FROM visites').get().count
    };

    // Statistiques par statut
    const statuts = db.prepare(`
      SELECT statut, COUNT(*) as count FROM personnel GROUP BY statut
    `).all();
    statuts.forEach(s => stats.par_statut[s.statut] = s.count);

    // Statistiques par niveau
    const niveaux = db.prepare(`
      SELECT niveau_hierarchique, COUNT(*) as count FROM personnel GROUP BY niveau_hierarchique
    `).all();
    niveaux.forEach(n => stats.par_niveau[n.niveau_hierarchique] = n.count);

    // Statistiques par service
    const services = db.prepare(`
      SELECT service, COUNT(*) as count FROM personnel GROUP BY service
    `).all();
    services.forEach(s => stats.par_service[s.service] = s.count);

    res.json(stats);
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    code: 'INTERNAL_ERROR'
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    code: 'NOT_FOUND'
  });
});

// Initialisation et démarrage
async function startServer() {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur DGI démarré sur http://localhost:${PORT}`);
      console.log(`📁 Logs: ${path.resolve(LOG_DIR)}`);
      console.log(`💾 Base de données: ${path.resolve(DB_DIR)}`);
      console.log(`🔑 API Key: ${API_KEY}`);
      console.log(`📊 Endpoints DGI:`);
      console.log(`   GET  /health - Health check`);
      console.log(`   GET  /api/dgi/personnel - Liste du personnel`);
      console.log(`   GET  /api/dgi/personnel/:id - Détails personnel`);
      console.log(`   GET  /api/dgi/services - Liste des services`);
      console.log(`   GET  /api/dgi/visites - Liste des visites`);
      console.log(`   POST /api/dgi/visites - Créer une visite`);
      console.log(`   GET  /api/dgi/stats - Statistiques`);
    });
  } catch (error) {
    console.error('❌ Erreur démarrage serveur:', error);
    process.exit(1);
  }
}

// Gestion de l'arrêt propre
process.on('SIGTERM', () => {
  console.log('📤 Arrêt du serveur DGI...');
  if (db) db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n📤 Arrêt du serveur DGI...');
  if (db) db.close();
  process.exit(0);
});

// Démarrer le serveur
startServer();
