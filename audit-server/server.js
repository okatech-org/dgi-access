#!/usr/bin/env node
/**
 * Serveur d'audit pour DGI Access Application
 * Collecte et stocke les événements d'audit des applications clientes
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;
const LOG_DIR = process.env.LOG_DIR || './logs';
const API_KEY = process.env.AUDIT_API_KEY || 'dev-audit-key-123';

// Configuration du rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // 100 requêtes
  duration: 60, // par minute
});

// Middleware de sécurité
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['http://localhost:5173', 'https://access.dgi.ga'],
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

// Créer le dossier de logs
await fs.mkdir(LOG_DIR, { recursive: true });

/**
 * Valide un événement d'audit
 */
function validateAuditEvent(event) {
  const required = ['timestamp', 'userId', 'userName', 'action', 'resource', 'status'];
  const missing = required.filter(field => !event[field]);
  
  if (missing.length > 0) {
    throw new Error(`Champs manquants: ${missing.join(', ')}`);
  }
  
  const validStatuses = ['success', 'failure', 'warning', 'alert'];
  if (!validStatuses.includes(event.status)) {
    throw new Error(`Statut invalide: ${event.status}`);
  }
  
  const validRiskLevels = ['low', 'medium', 'high', 'critical'];
  if (event.riskLevel && !validRiskLevels.includes(event.riskLevel)) {
    throw new Error(`Niveau de risque invalide: ${event.riskLevel}`);
  }
}

/**
 * Sauvegarde un événement d'audit
 */
async function saveAuditEvent(event) {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const fileName = `audit-${date}.jsonl`;
  const filePath = path.join(LOG_DIR, fileName);
  
  const logEntry = JSON.stringify({
    ...event,
    serverTimestamp: new Date().toISOString(),
    serverIP: process.env.SERVER_IP || 'unknown'
  }) + '\n';
  
  await fs.appendFile(filePath, logEntry);
}

/**
 * Génère des statistiques d'audit
 */
async function generateStats(startDate, endDate) {
  const files = await fs.readdir(LOG_DIR);
  const auditFiles = files.filter(f => f.startsWith('audit-') && f.endsWith('.jsonl'));
  
  let totalEvents = 0;
  const stats = {
    byAction: {},
    byStatus: {},
    byRiskLevel: {},
    byUser: {},
    timeRange: { start: startDate, end: endDate }
  };
  
  for (const file of auditFiles) {
    const filePath = path.join(LOG_DIR, file);
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    
    for (const line of lines) {
      try {
        const event = JSON.parse(line);
        const eventDate = event.timestamp || event.serverTimestamp;
        
        // Filtrer par date si spécifié
        if (startDate && eventDate < startDate) continue;
        if (endDate && eventDate > endDate) continue;
        
        totalEvents++;
        
        // Statistiques par action
        stats.byAction[event.action] = (stats.byAction[event.action] || 0) + 1;
        
        // Statistiques par statut
        stats.byStatus[event.status] = (stats.byStatus[event.status] || 0) + 1;
        
        // Statistiques par niveau de risque
        if (event.riskLevel) {
          stats.byRiskLevel[event.riskLevel] = (stats.byRiskLevel[event.riskLevel] || 0) + 1;
        }
        
        // Statistiques par utilisateur
        stats.byUser[event.userName] = (stats.byUser[event.userName] || 0) + 1;
      } catch (e) {
        console.error('Erreur parsing event:', e.message);
      }
    }
  }
  
  return { totalEvents, ...stats };
}

// Routes API

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime()
  });
});

/**
 * Réception des événements d'audit
 */
app.post('/api/logs', rateLimitMiddleware, authenticateAPI, async (req, res) => {
  try {
    const { events } = req.body;
    
    if (!Array.isArray(events)) {
      return res.status(400).json({
        error: 'Le champ "events" doit être un tableau',
        code: 'INVALID_FORMAT'
      });
    }
    
    const results = [];
    
    for (const event of events) {
      try {
        validateAuditEvent(event);
        await saveAuditEvent(event);
        results.push({ success: true, eventId: event.id });
      } catch (error) {
        results.push({ 
          success: false, 
          eventId: event.id || 'unknown',
          error: error.message 
        });
      }
    }
    
    const successful = results.filter(r => r.success).length;
    
    res.json({
      processed: events.length,
      successful,
      failed: events.length - successful,
      results: results.length <= 10 ? results : undefined // Limiter la réponse
    });
    
    console.log(`📊 Audit: ${successful}/${events.length} événements traités`);
    
  } catch (error) {
    console.error('Erreur traitement audit:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * Récupération des statistiques
 */
app.get('/api/stats', authenticateAPI, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await generateStats(startDate, endDate);
    
    res.json(stats);
  } catch (error) {
    console.error('Erreur génération stats:', error);
    res.status(500).json({
      error: 'Erreur génération statistiques',
      code: 'STATS_ERROR'
    });
  }
});

/**
 * Recherche dans les logs
 */
app.get('/api/search', authenticateAPI, async (req, res) => {
  try {
    const { 
      q, 
      action, 
      userId, 
      status,
      startDate, 
      endDate, 
      limit = 100, 
      offset = 0 
    } = req.query;
    
    const files = await fs.readdir(LOG_DIR);
    const auditFiles = files.filter(f => f.startsWith('audit-') && f.endsWith('.jsonl'));
    
    const events = [];
    
    for (const file of auditFiles) {
      const filePath = path.join(LOG_DIR, file);
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.trim().split('\n').filter(Boolean);
      
      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          
          // Filtres
          if (startDate && event.timestamp < startDate) continue;
          if (endDate && event.timestamp > endDate) continue;
          if (action && event.action !== action) continue;
          if (userId && event.userId !== userId) continue;
          if (status && event.status !== status) continue;
          if (q && !JSON.stringify(event).toLowerCase().includes(q.toLowerCase())) continue;
          
          events.push(event);
        } catch (e) {
          // Ignorer les lignes malformées
        }
      }
    }
    
    // Trier par timestamp décroissant
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Pagination
    const paginatedEvents = events.slice(offset, offset + parseInt(limit));
    
    res.json({
      total: events.length,
      offset: parseInt(offset),
      limit: parseInt(limit),
      events: paginatedEvents
    });
    
  } catch (error) {
    console.error('Erreur recherche:', error);
    res.status(500).json({
      error: 'Erreur de recherche',
      code: 'SEARCH_ERROR'
    });
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

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur d'audit démarré sur http://localhost:${PORT}`);
  console.log(`📁 Logs stockés dans: ${path.resolve(LOG_DIR)}`);
  console.log(`🔑 API Key: ${API_KEY}`);
  console.log(`📊 Endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /api/logs - Réception événements`);
  console.log(`   GET  /api/stats - Statistiques`);
  console.log(`   GET  /api/search - Recherche dans les logs`);
});

// Gestion de l'arrêt propre
process.on('SIGTERM', () => {
  console.log('📤 Arrêt du serveur d\'audit...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n📤 Arrêt du serveur d\'audit...');
  process.exit(0);
});
