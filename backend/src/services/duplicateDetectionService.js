const { getSupabaseClient } = require('../config/supabase');
const logger = require('../utils/logger');

// Common English stopwords to ignore in semantic overlap
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'there', 'this', 'near', 'room'
]);

/**
 * Tokenize text into normalized unique words
 */
function tokenize(text) {
  if (!text) return new Set();
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  return new Set(words);
}

/**
 * Jaccard similarity between two token sets
 */
function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Check a complaint against candidates for potential duplication
 * Multi-signal scoring:
 * - Title similarity (weight 0.40)
 * - Description similarity (weight 0.35)
 * - Category exact match (weight 0.15)
 * - Location exact match (weight 0.10)
 */
function calculateDuplicateScore(target, candidate) {
  const targetTitleTokens = tokenize(target.title);
  const candidateTitleTokens = tokenize(candidate.title);
  const titleSim = jaccardSimilarity(targetTitleTokens, candidateTitleTokens);

  const targetDescTokens = tokenize(target.description);
  const candidateDescTokens = tokenize(candidate.description);
  const descSim = jaccardSimilarity(targetDescTokens, candidateDescTokens);

  const categoryMatch = target.category && candidate.category &&
    target.category.toLowerCase() === candidate.category.toLowerCase() ? 1.0 : 0.0;

  let locationMatch = 0.0;
  if (target.building_id && candidate.building_id && target.building_id === candidate.building_id) {
    locationMatch = 0.5;
    if (target.floor_id && candidate.floor_id && target.floor_id === candidate.floor_id) {
      locationMatch = 0.8;
      if (target.room_id && candidate.room_id && target.room_id === candidate.room_id) {
        locationMatch = 1.0;
      }
    }
  } else if (target.general_location && candidate.general_location) {
    const locA = tokenize(target.general_location);
    const locB = tokenize(candidate.general_location);
    locationMatch = jaccardSimilarity(locA, locB);
  }

  // Combined weighted score
  const totalScore = (titleSim * 0.40) + (descSim * 0.35) + (categoryMatch * 0.15) + (locationMatch * 0.10);

  // Common matched keywords for transparency
  const matchedTokens = [...targetTitleTokens].filter((t) => candidateTitleTokens.has(t) || candidateDescTokens.has(t));

  return {
    score: Math.min(1.0, Math.round(totalScore * 100) / 100),
    titleSimilarity: Math.round(titleSim * 100) / 100,
    descSimilarity: Math.round(descSim * 100) / 100,
    categoryMatch: Boolean(categoryMatch),
    locationMatch: Math.round(locationMatch * 100) / 100,
    matchedKeywords: matchedTokens.slice(0, 5),
  };
}

/**
 * Scan existing complaints for duplicates
 */
async function findDuplicates({ title, description, category, building_id, floor_id, room_id, general_location, excludeId = null }) {
  const complaintService = require('./complaintService');
  const allComplaints = await complaintService.getAdminComplaints({ limit: 100 });
  const candidates = (allComplaints?.data || []).filter((c) => c.id !== excludeId && c.status !== 'rejected');

  const matches = [];

  for (const candidate of candidates) {
    const analysis = calculateDuplicateScore(
      { title, description, category, building_id, floor_id, room_id, general_location },
      candidate
    );

    if (analysis.score >= 0.35) {
      matches.push({
        complaint: {
          id: candidate.id,
          tracking_code: candidate.tracking_code,
          title: candidate.title,
          category: candidate.category,
          status: candidate.status,
          priority: candidate.priority,
          created_at: candidate.created_at,
          general_location: candidate.general_location,
        },
        similarityScore: analysis.score,
        isLikelyDuplicate: analysis.score >= 0.65,
        analysis,
      });
    }
  }

  // Sort by highest similarity
  matches.sort((a, b) => b.similarityScore - a.similarityScore);

  return {
    hasPossibleDuplicates: matches.length > 0,
    highConfidenceMatch: matches.some((m) => m.similarityScore >= 0.70),
    matches: matches.slice(0, 5),
  };
}

/**
 * Link a complaint as duplicate of another
 */
async function linkDuplicate(complaintId, duplicateOfId, actorUser) {
  const complaintService = require('./complaintService');
  const target = await complaintService.getComplaintById(complaintId, actorUser);
  const primary = await complaintService.getComplaintById(duplicateOfId, actorUser);

  if (!target || !primary) {
    const error = new Error('One or both complaints not found');
    error.statusCode = 404;
    throw error;
  }

  target.duplicate_of = duplicateOfId;
  target.is_duplicate = true;

  await complaintService.recordStatusTransition(
    target,
    target.status,
    actorUser.id,
    `Linked as duplicate of ticket ${primary.tracking_code || duplicateOfId}.`
  );

  return {
    success: true,
    message: `Ticket linked as duplicate of ${primary.tracking_code || duplicateOfId}.`,
    complaintId,
    duplicateOfId,
  };
}

module.exports = {
  findDuplicates,
  linkDuplicate,
  calculateDuplicateScore,
};
