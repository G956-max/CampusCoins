const config = require('../config/env');
const logger = require('../utils/logger');
const { getSupabaseClient } = require('../config/supabase');

// Category Keyword Dictionaries for Transparent Rule-Based Baseline
const CATEGORY_LEXICON = {
  'Electrical': ['light', 'tube', 'bulb', 'wire', 'switch', 'spark', 'power', 'socket', 'fuse', 'fan', 'ac', 'cooler', 'voltage', 'short circuit'],
  'Plumbing': ['leak', 'pipe', 'tap', 'water', 'basin', 'faucet', 'drain', 'flush', 'clogged', 'toilet', 'sewage', 'sink'],
  'Classroom': ['projector', 'board', 'blackboard', 'whiteboard', 'bench', 'desk', 'podium', 'speaker', 'audio', 'mic', 'screen'],
  'Laboratory': ['equipment', 'multimeter', 'chemical', 'microscope', 'oscilloscope', 'pc', 'hardware', 'cable', 'lab'],
  'Wi-Fi / Internet': ['wifi', 'wi-fi', 'internet', 'lan', 'ethernet', 'slow network', 'disconnect', 'router', 'gateway', 'login portal'],
  'Furniture': ['chair', 'table', 'desk', 'bench', 'door', 'window', 'handle', 'hinge', 'broken leg', 'lock'],
  'Cleaning': ['dust', 'trash', 'garbage', 'dirty', 'sweep', 'mop', 'spill', 'litter', 'smell', 'odor', 'restroom dirty'],
  'Security': ['id card', 'gate', 'guard', 'theft', 'unauthorized', 'cctv', 'surveillance', 'lost item'],
  'Transport': ['bus', 'shuttle', 'van', 'route', 'driver', 'schedule', 'parking'],
};

// Urgency keywords for priority calculation
const URGENCY_TRIGGERS = {
  critical: ['sparking', 'smoke', 'fire', 'electric shock', 'flood', 'burst pipe', 'hazardous', 'emergency', 'collapsed', 'gas leak'],
  high: ['leakage', 'overflow', 'flickering', 'no power', 'broken lock', 'blackout', 'urgent', 'exam tomorrow', 'ac breakdown'],
  medium: ['not working', 'malfunction', 'damaged', 'slow', 'noisy', 'replacement', 'cracked'],
  low: ['dirty', 'dusty', 'cosmetic', 'minor scratch', 'suggestion', 'routine'],
};

/**
 * Classify a complaint's category with confidence scoring
 */
async function classifyComplaintText(title = '', description = '') {
  const combinedText = `${title} ${description}`.toLowerCase();

  // If external AI microservice is configured, call it
  if (config.aiServiceUrl) {
    try {
      const axios = require('axios');
      const response = await axios.post(`${config.aiServiceUrl}/classify`, {
        text: combinedText,
      }, { timeout: 4000 });

      if (response.data && response.data.category) {
        return {
          suggestedCategory: response.data.category,
          confidence: response.data.confidence || 0.85,
          source: 'external_ml_model',
          reasoning: response.data.reasoning || 'Classified via fine-tuned NLP classifier.',
        };
      }
    } catch (err) {
      logger.warn(`[AI SERVICE] External microservice unavailable (${err.message}). Using transparent rule-based baseline.`);
    }
  }

  // Rule-based transparent baseline
  let bestCategory = 'Other';
  let maxMatches = 0;
  let matchedKeywords = [];

  for (const [category, keywords] of Object.entries(CATEGORY_LEXICON)) {
    const found = keywords.filter((kw) => combinedText.includes(kw));
    if (found.length > maxMatches) {
      maxMatches = found.length;
      bestCategory = category;
      matchedKeywords = found;
    }
  }

  const confidence = maxMatches > 0
    ? Math.min(0.92, 0.40 + maxMatches * 0.15)
    : 0.35;

  return {
    suggestedCategory: bestCategory,
    confidence: Math.round(confidence * 100) / 100,
    source: 'rule_based_baseline',
    matchedKeywords,
    reasoning: maxMatches > 0
      ? `Detected ${maxMatches} category keyword match(es): ${matchedKeywords.join(', ')}.`
      : 'General keyword analysis; manual verification recommended.',
  };
}

/**
 * Suggest complaint priority based on urgency keywords and category
 */
function suggestPriority(category = '', title = '', description = '') {
  const combinedText = `${title} ${description}`.toLowerCase();

  for (const kw of URGENCY_TRIGGERS.critical) {
    if (combinedText.includes(kw)) {
      return {
        suggestedPriority: 'critical',
        confidence: 0.90,
        triggerKeyword: kw,
        reasoning: `Critical urgency trigger detected: "${kw}". Immediate health/safety concern.`,
      };
    }
  }

  for (const kw of URGENCY_TRIGGERS.high) {
    if (combinedText.includes(kw)) {
      return {
        suggestedPriority: 'high',
        confidence: 0.82,
        triggerKeyword: kw,
        reasoning: `High priority indicator detected: "${kw}". Significant operational disruption.`,
      };
    }
  }

  for (const kw of URGENCY_TRIGGERS.medium) {
    if (combinedText.includes(kw)) {
      return {
        suggestedPriority: 'medium',
        confidence: 0.75,
        triggerKeyword: kw,
        reasoning: `Standard maintenance indicator detected: "${kw}".`,
      };
    }
  }

  return {
    suggestedPriority: 'low',
    confidence: 0.65,
    triggerKeyword: null,
    reasoning: 'Routine request without acute hazard indicators.',
  };
}

/**
 * AI Admin Assistant: Read-only Natural Language Query Engine
 * Accurately answers questions with real measured database metrics.
 */
async function aiAdminAssistantQuery(userPrompt, adminUser) {
  if (adminUser.role !== 'admin') {
    const error = new Error('Unauthorized: AI Admin Assistant is reserved for administrators.');
    error.statusCode = 403;
    throw error;
  }

  const complaintService = require('./complaintService');
  const slaService = require('./slaService');
  const { inMemoryTransactions, inMemoryWallets } = require('./coinService');

  const allResult = await complaintService.getAdminComplaints({ limit: 100 });
  const complaints = allResult?.data || [];
  const slaReport = await slaService.getSlaPerformanceReport();

  const promptLower = (userPrompt || '').toLowerCase();

  // Metrics computation
  const totalTickets = complaints.length;
  const activeTickets = complaints.filter((c) => !['resolved', 'verified', 'rejected'].includes(c.status)).length;
  const overdueTickets = slaReport.metrics.overdueActive;
  const complianceRate = slaReport.metrics.complianceRate;
  const totalCoinsAwarded = inMemoryTransactions
    .filter((tx) => tx.amount > 0 && tx.transaction_type !== 'refund')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Group by category
  const categoryCounts = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0] || ['None', 0];

  // Pattern matching queries
  let answer = '';
  let metricsData = {};

  if (promptLower.includes('overdue') || promptLower.includes('sla') || promptLower.includes('breach')) {
    answer = `There are currently **${overdueTickets} overdue complaints** out of ${activeTickets} active tickets. The overall institutional SLA resolution compliance rate is **${complianceRate}%**.`;
    metricsData = { overdueTickets, activeTickets, complianceRate };
  } else if (promptLower.includes('category') || promptLower.includes('recurring') || promptLower.includes('most')) {
    answer = `The most frequent category is **${topCategory[0]}** with **${topCategory[1]} complaints** logged (${Math.round((topCategory[1] / Math.max(1, totalTickets)) * 100)}% of total issues).`;
    metricsData = { topCategory: topCategory[0], count: topCategory[1], breakdown: categoryCounts };
  } else if (promptLower.includes('coin') || promptLower.includes('token') || promptLower.includes('reward')) {
    answer = `To date, students have earned a verified total of **${totalCoinsAwarded} CampusCoins** across completed and verified campus activities.`;
    metricsData = { totalCoinsAwarded, totalWallets: inMemoryWallets.size };
  } else {
    answer = `Campus Overview: **${totalTickets} total complaints** (${activeTickets} active, ${overdueTickets} overdue). Top category: **${topCategory[0]}** (${topCategory[1]} tickets). SLA Compliance: **${complianceRate}%**. Total CampusCoins awarded: **${totalCoinsAwarded}**.`;
    metricsData = { totalTickets, activeTickets, overdueTickets, complianceRate, totalCoinsAwarded };
  }

  return {
    query: userPrompt,
    answer,
    verifiedMetrics: metricsData,
    generatedAt: new Date().toISOString(),
    isMeasuredData: true,
  };
}

module.exports = {
  classifyComplaintText,
  suggestPriority,
  aiAdminAssistantQuery,
  CATEGORY_LEXICON,
};
