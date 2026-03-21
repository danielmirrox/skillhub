const { randomUUID } = require('crypto');
const { seedData } = require('../../../scripts/seed');
const { isDatabaseConfigured, isDatabaseReady, query, bootstrapDatabase, loadSnapshot, setDatabaseReady } = require('./db');

const nowIso = () => new Date().toISOString();
const clone = (value) => JSON.parse(JSON.stringify(value));
const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const users = clone(seedData.users);
const profiles = clone(seedData.profiles);
const ratings = clone(seedData.ratings);
const teams = clone(seedData.teams);
const teamMembers = clone(seedData.teamMembers);
const applications = clone(seedData.applications);

function replaceCollection(target, source) {
  target.splice(0, target.length, ...clone(source));
}

function hydrateFromSnapshot(snapshot) {
  if (!snapshot) {
    return;
  }

  replaceCollection(users, snapshot.users || []);
  replaceCollection(profiles, snapshot.profiles || []);
  replaceCollection(ratings, snapshot.ratings || []);
  replaceCollection(teams, snapshot.teams || []);
  replaceCollection(teamMembers, snapshot.teamMembers || []);
  replaceCollection(applications, snapshot.applications || []);
}

async function initializeStore() {
  if (!isDatabaseConfigured()) {
    return {
      enabled: false,
      seeded: false,
    };
  }

  try {
    const bootstrapResult = await bootstrapDatabase();
    const snapshot = await loadSnapshot();
    hydrateFromSnapshot(snapshot);

    return {
      enabled: true,
      seeded: Boolean(bootstrapResult.seeded),
    };
  } catch (error) {
    setDatabaseReady(false);
    console.warn('PostgreSQL bootstrap failed, falling back to in-memory demo store.');
    console.warn(error?.message || error);

    return {
      enabled: false,
      seeded: false,
      fallback: true,
    };
  }
}

function toDatabaseJson(value) {
  return value == null ? null : JSON.stringify(value);
}

async function persistUser(user) {
  if (!isDatabaseReady()) {
    return;
  }

  await query(
    `INSERT INTO users (id, github_id, telegram_id, email, username, avatar_url, display_name, is_pro, pro_expires_at, user_role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     ON CONFLICT (id) DO UPDATE SET
       github_id = EXCLUDED.github_id,
       telegram_id = EXCLUDED.telegram_id,
       email = EXCLUDED.email,
       username = EXCLUDED.username,
       avatar_url = EXCLUDED.avatar_url,
       display_name = EXCLUDED.display_name,
       is_pro = EXCLUDED.is_pro,
       pro_expires_at = EXCLUDED.pro_expires_at,
       user_role = EXCLUDED.user_role,
       updated_at = EXCLUDED.updated_at`,
    [
      user.id,
      user.githubId ?? null,
      user.telegramId ?? null,
      user.email ?? null,
      user.username ?? null,
      user.avatarUrl ?? null,
      user.displayName ?? null,
      Boolean(user.isPro),
      user.proExpiresAt ?? null,
      user.userRole ?? 'participant',
      user.createdAt ?? nowIso(),
      user.updatedAt ?? nowIso(),
    ],
  );
}

async function persistProfile(profile) {
  if (!isDatabaseReady()) {
    return;
  }

  await query(
    `INSERT INTO profiles (id, user_id, role, claimed_grade, primary_stack, experience_years, hackathons_count, bio, project_links, telegram_username, github_url, github_data, is_public, last_scored_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9::jsonb, $10, $11, $12::jsonb, $13, $14, $15, $16)
     ON CONFLICT (id) DO UPDATE SET
       user_id = EXCLUDED.user_id,
       role = EXCLUDED.role,
       claimed_grade = EXCLUDED.claimed_grade,
       primary_stack = EXCLUDED.primary_stack,
       experience_years = EXCLUDED.experience_years,
       hackathons_count = EXCLUDED.hackathons_count,
       bio = EXCLUDED.bio,
       project_links = EXCLUDED.project_links,
       telegram_username = EXCLUDED.telegram_username,
       github_url = EXCLUDED.github_url,
       github_data = EXCLUDED.github_data,
       is_public = EXCLUDED.is_public,
       last_scored_at = EXCLUDED.last_scored_at,
       updated_at = EXCLUDED.updated_at`,
    [
      profile.id,
      profile.userId,
      profile.role,
      profile.claimedGrade,
      toDatabaseJson(profile.primaryStack || []),
      profile.experienceYears ?? 0,
      profile.hackathonsCount ?? 0,
      profile.bio ?? '',
      toDatabaseJson(profile.projectLinks || []),
      profile.telegramUsername ?? null,
      profile.githubUrl ?? null,
      toDatabaseJson(profile.githubData ?? null),
      Boolean(profile.isPublic),
      profile.lastScoredAt ?? null,
      profile.createdAt ?? nowIso(),
      profile.updatedAt ?? nowIso(),
    ],
  );
}

async function persistRating(rating) {
  if (!isDatabaseReady()) {
    return;
  }

  await query(
    `INSERT INTO ratings (id, profile_id, score, grade, role_label, strengths, improvements, raw_response, created_at)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9)
     ON CONFLICT (id) DO NOTHING`,
    [
      rating.id,
      rating.profileId,
      rating.score,
      rating.grade,
      rating.roleLabel,
      toDatabaseJson(rating.strengths || []),
      toDatabaseJson(rating.improvements || []),
      toDatabaseJson(rating.rawResponse || {}),
      rating.createdAt ?? nowIso(),
    ],
  );
}

async function persistTeam(team) {
  if (!isDatabaseReady()) {
    return;
  }

  await query(
    `INSERT INTO teams (id, author_id, name, description, hackathon_name, required_roles, min_rating, stack, slots_open, is_active, status, updated_at, deleted_at, created_at)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb, $9, $10, $11, $12, $13, $14)
     ON CONFLICT (id) DO UPDATE SET
       author_id = EXCLUDED.author_id,
       name = EXCLUDED.name,
       description = EXCLUDED.description,
       hackathon_name = EXCLUDED.hackathon_name,
       required_roles = EXCLUDED.required_roles,
       min_rating = EXCLUDED.min_rating,
       stack = EXCLUDED.stack,
       slots_open = EXCLUDED.slots_open,
       is_active = EXCLUDED.is_active,
       status = EXCLUDED.status,
       updated_at = EXCLUDED.updated_at,
       deleted_at = EXCLUDED.deleted_at`,
    [
      team.id,
      team.authorId,
      team.name,
      team.description,
      team.hackathonName,
      toDatabaseJson(team.requiredRoles || []),
      team.minRating ?? null,
      toDatabaseJson(team.stack || []),
      team.slotsOpen ?? 1,
      Boolean(team.isActive),
      team.status || 'active',
      team.updatedAt ?? nowIso(),
      team.deletedAt ?? null,
      team.createdAt ?? nowIso(),
    ],
  );
}

async function persistTeamMember(teamMember) {
  if (!isDatabaseReady()) {
    return;
  }

  await query(
    `INSERT INTO team_members (id, team_id, user_id, role, joined_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO UPDATE SET
       team_id = EXCLUDED.team_id,
       user_id = EXCLUDED.user_id,
       role = EXCLUDED.role,
       joined_at = EXCLUDED.joined_at`,
    [
      teamMember.id,
      teamMember.teamId,
      teamMember.userId,
      teamMember.role,
      teamMember.joinedAt ?? nowIso(),
    ],
  );
}

async function persistApplication(application) {
  if (!isDatabaseReady()) {
    return;
  }

  await query(
    `INSERT INTO applications (id, applicant_id, team_id, message, status, viewed_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (id) DO UPDATE SET
       applicant_id = EXCLUDED.applicant_id,
       team_id = EXCLUDED.team_id,
       message = EXCLUDED.message,
       status = EXCLUDED.status,
       viewed_at = EXCLUDED.viewed_at,
       updated_at = EXCLUDED.updated_at`,
    [
      application.id,
      application.applicantId,
      application.teamId,
      application.message || '',
      application.status || 'pending',
      application.viewedAt ?? null,
      application.createdAt ?? nowIso(),
      application.updatedAt ?? nowIso(),
    ],
  );
}

function getUserById(id) {
  return users.find((user) => user.id === id) || null;
}

function getDefaultViewer() {
  return getUserById('user-daniel');
}

function getProfileByUserId(userId) {
  return profiles.find((profile) => profile.userId === userId) || null;
}

function getRatingByProfileId(profileId) {
  return ratings
    .filter((rating) => rating.profileId === profileId)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0] || null;
}

function getRatingByUserId(userId) {
  const profile = getProfileByUserId(userId);
  return profile ? getRatingByProfileId(profile.id) : null;
}

function calculateContactVisible(viewer, targetRating) {
  return Boolean(viewer?.isPro && targetRating?.score >= 80);
}

const SEARCH_SYNONYM_GROUPS = [
  ['frontend', 'ui', 'ux', 'interface', 'web', 'client', 'react', 'next', 'vite', 'css', 'html'],
  ['backend', 'api', 'server', 'service', 'node', 'express', 'postgres', 'database', 'sql', 'redis'],
  ['design', 'figma', 'mockup', 'prototype', 'system', 'designsystem', 'ui', 'ux'],
  ['mobile', 'android', 'ios', 'app', 'flutter', 'reactnative'],
  ['ml', 'ai', 'machine', 'learning', 'machinelearning', 'llm', 'data', 'model', 'nlp'],
  ['fullstack', 'full', 'stack'],
  ['junior', 'jr'],
  ['middle', 'mid'],
  ['senior', 'sr'],
];

const SEARCH_SYNONYM_LOOKUP = new Map();

SEARCH_SYNONYM_GROUPS.forEach((group) => {
  group.forEach((token) => {
    SEARCH_SYNONYM_LOOKUP.set(token, group);
  });
});

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-z0-9а-я]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeSearchText(value) {
  const normalized = normalizeSearchText(value);
  if (!normalized) {
    return [];
  }

  return normalized.split(' ').filter(Boolean);
}

function uniqueTokens(tokens) {
  return [...new Set(tokens.filter(Boolean))];
}

function expandSearchToken(token) {
  return SEARCH_SYNONYM_LOOKUP.get(token) || [token];
}

function expandSearchTokens(tokens) {
  const expanded = [];

  tokens.forEach((token) => {
    expanded.push(...expandSearchToken(token));
  });

  return uniqueTokens(expanded);
}

function levenshteinDistance(left, right) {
  if (left === right) {
    return 0;
  }

  if (!left.length) {
    return right.length;
  }

  if (!right.length) {
    return left.length;
  }

  const previousRow = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const currentRow = [leftIndex];

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const insertCost = currentRow[rightIndex - 1] + 1;
      const deleteCost = previousRow[rightIndex] + 1;
      const substituteCost = previousRow[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1);
      currentRow.push(Math.min(insertCost, deleteCost, substituteCost));
    }

    for (let index = 0; index < previousRow.length; index += 1) {
      previousRow[index] = currentRow[index];
    }
  }

  return previousRow[right.length];
}

function tokenMatchStrength(queryToken, candidateToken) {
  if (queryToken === candidateToken) {
    return 1;
  }

  if (queryToken.length >= 3 && candidateToken.includes(queryToken)) {
    return 0.9;
  }

  if (candidateToken.length >= 3 && queryToken.includes(candidateToken)) {
    return 0.85;
  }

  const maxDistance = Math.max(1, Math.floor(Math.min(queryToken.length, candidateToken.length) / 4));
  const distance = levenshteinDistance(queryToken, candidateToken);
  if (distance <= maxDistance) {
    return distance === 1 ? 0.78 : 0.68;
  }

  return 0;
}

function buildSearchField(label, value, weight) {
  const normalizedText = normalizeSearchText(value);
  const rawTokens = tokenizeSearchText(value);
  const searchTokens = expandSearchTokens(rawTokens);

  return {
    label,
    value: normalizedText,
    weight,
    tokens: searchTokens,
  };
}

function scoreSearchItem(item, search) {
  const normalizedQuery = normalizeSearchText(search);
  if (!normalizedQuery) {
    return null;
  }

  const queryTokens = expandSearchTokens(tokenizeSearchText(search));
  if (!queryTokens.length) {
    return null;
  }

  const fields = [
    buildSearchField('name', item.displayName, 26),
    buildSearchField('username', item.username || '', 24),
    buildSearchField('stack', item.primaryStack.join(' '), 22),
    buildSearchField('bio', item.bio, 16),
    buildSearchField('role', item.role || '', 18),
    buildSearchField('grade', item.claimedGrade || '', 14),
    buildSearchField('projects', (item.projectLinks || []).map((project) => `${project.title} ${project.description}`).join(' '), 18),
    buildSearchField('rating', item.rating?.grade || '', 10),
  ];

  let totalScore = 0;
  const reasonKeys = new Set();
  const matchedTerms = new Set();

  queryTokens.forEach((queryToken) => {
    let tokenBestScore = 0;
    let tokenBestField = null;

    fields.forEach((field) => {
      if (!field.tokens.length) {
        return;
      }

      const fieldMatchScore = field.tokens.reduce((best, candidateToken) => Math.max(best, tokenMatchStrength(queryToken, candidateToken)), 0);
      if (fieldMatchScore <= 0) {
        return;
      }

      const fieldScore = field.weight * fieldMatchScore;
      if (fieldScore > tokenBestScore) {
        tokenBestScore = fieldScore;
        tokenBestField = field.label;
      }
    });

    if (tokenBestScore > 0) {
      totalScore += tokenBestScore;
      matchedTerms.add(queryToken);
      if (tokenBestField) {
        reasonKeys.add(tokenBestField);
      }
    }
  });

  const phraseBoost = fields.reduce((sum, field) => {
    if (!field.value || !field.value.includes(normalizedQuery)) {
      return sum;
    }

    reasonKeys.add(field.label);
    return sum + field.weight * 0.45;
  }, 0);

  const ratingBoost = item.rating?.score ? Math.min(item.rating.score / 18, 5) : 0;
  const finalScore = Math.min(100, Math.round(totalScore + phraseBoost + ratingBoost));

  if (finalScore <= 0) {
    return null;
  }

  const reasonLabels = {
    name: 'совпадение по имени',
    username: 'совпадение по username',
    stack: 'совпадение по стеку',
    bio: 'совпадение по bio',
    role: 'совпадение по роли',
    grade: 'совпадение по грейду',
    projects: 'совпадение по проектам',
    rating: 'подтягивается AI-рейтинг',
  };

  return {
    score: finalScore,
    reasons: uniqueTokens([...reasonKeys].map((key) => reasonLabels[key]).filter(Boolean)).slice(0, 4),
    matchedTerms: [...matchedTerms].slice(0, 6),
  };
}

function formatRating(rating, viewer) {
  if (!rating) {
    return null;
  }

  const base = {
    score: rating.score,
    grade: rating.grade,
    roleLabel: rating.roleLabel,
  };

  if (viewer?.isPro) {
    return {
      ...base,
      strengths: clone(rating.strengths || []),
      improvements: clone(rating.improvements || []),
    };
  }

  return base;
}

function buildPublicProfile(profile, viewer) {
  const user = getUserById(profile.userId);
  const rating = getRatingByProfileId(profile.id);

  return {
    id: profile.id,
    userId: profile.userId,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: profile.role,
    claimedGrade: profile.claimedGrade,
    primaryStack: clone(profile.primaryStack),
    bio: profile.bio,
    projectLinks: clone(profile.projectLinks),
    rating: formatRating(rating, viewer),
    contactVisible: calculateContactVisible(viewer, rating),
    telegramUsername: calculateContactVisible(viewer, rating) ? profile.telegramUsername : null,
  };
}

function buildOwnProfile(userId, viewer) {
  const user = getUserById(userId);
  const profile = getProfileByUserId(userId);
  const rating = profile ? getRatingByProfileId(profile.id) : null;

  return {
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      email: user.email,
      isPro: user.isPro,
      proExpiresAt: user.proExpiresAt,
      userRole: user.userRole,
    },
    profile: profile
      ? {
          id: profile.id,
          role: profile.role,
          claimedGrade: profile.claimedGrade,
          primaryStack: clone(profile.primaryStack),
          experienceYears: profile.experienceYears,
          hackathonsCount: profile.hackathonsCount,
          bio: profile.bio,
          projectLinks: clone(profile.projectLinks),
          telegramUsername: profile.telegramUsername,
          githubUrl: profile.githubUrl,
          isPublic: profile.isPublic,
          hasRating: Boolean(rating),
          lastRatingScore: rating?.score || null,
          rating: formatRating(rating, viewer),
        }
      : null,
  };
}

function listUsers(query = {}, viewer) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const search = query.search ? String(query.search).toLowerCase() : '';

  let items = users
    .map((user) => {
      const profile = getProfileByUserId(user.id);
      const rating = profile ? getRatingByProfileId(profile.id) : null;
      const searchMatch = scoreSearchItem(
        {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          primaryStack: profile ? clone(profile.primaryStack) : [],
          bio: profile?.bio || '',
          role: profile?.role || null,
          claimedGrade: profile?.claimedGrade || null,
          projectLinks: profile ? clone(profile.projectLinks) : [],
          rating: formatRating(rating, viewer),
        },
        query.search || ''
      );

      return {
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: profile?.role || null,
        claimedGrade: profile?.claimedGrade || null,
        primaryStack: profile ? clone(profile.primaryStack) : [],
        rating: formatRating(rating, viewer),
        contactVisible: calculateContactVisible(viewer, rating),
        isPro: user.isPro,
        bio: profile?.bio || '',
        searchMatch,
      };
    })
    .filter((item) => {
      if (query.role && item.role !== query.role) return false;
      if (query.grade && item.claimedGrade !== query.grade) return false;
      if (typeof query.minRating === 'number' && (item.rating?.score || 0) < query.minRating) return false;
      if (query.stack) {
        const stackTokens = String(query.stack)
          .split(',')
          .map((token) => token.trim().toLowerCase())
          .filter(Boolean);
        const joinedStack = item.primaryStack.map((value) => value.toLowerCase());
        if (!stackTokens.every((token) => joinedStack.includes(token))) return false;
      }
      if (search) {
        if (!item.searchMatch || item.searchMatch.score <= 0) return false;
      }
      return true;
    })
    .sort((left, right) => {
      if (search) {
        const relevanceDelta = (right.searchMatch?.score || 0) - (left.searchMatch?.score || 0);
        if (relevanceDelta !== 0) {
          return relevanceDelta;
        }
      }

      return (right.rating?.score || 0) - (left.rating?.score || 0);
    });

  const total = items.length;
  const startIndex = (page - 1) * limit;
  items = items.slice(startIndex, startIndex + limit);

  return {
    items,
    total,
    page,
    limit,
  };
}

function buildUserSummary(userId, viewer) {
  const user = getUserById(userId);
  if (!user) {
    return null;
  }

  const profile = getProfileByUserId(userId);
  const rating = profile ? getRatingByProfileId(profile.id) : null;

  return {
    id: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: profile?.role || null,
    claimedGrade: profile?.claimedGrade || null,
    primaryStack: profile ? clone(profile.primaryStack) : [],
    rating: formatRating(rating, viewer),
    contactVisible: calculateContactVisible(viewer, rating),
    telegramUsername: calculateContactVisible(viewer, rating) ? profile?.telegramUsername || null : null,
    bio: profile?.bio || '',
  };
}

function getRatingHistoryByUserId(userId) {
  const profile = getProfileByUserId(userId);
  if (!profile) {
    return [];
  }

  return ratings
    .filter((rating) => rating.profileId === profile.id)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .map((rating) => clone(rating));
}

function getScoreJobStatus(jobId, userId) {
  const profile = getProfileByUserId(userId);
  if (!profile) {
    return null;
  }

  const rating = ratings.find((item) => item.id === jobId && item.profileId === profile.id);
  if (!rating) {
    return null;
  }

  return {
    jobId,
    status: 'completed',
    score: rating.score,
    createdAt: rating.createdAt,
  };
}

function getTeamMembers(teamId) {
  return teamMembers.filter((member) => member.teamId === teamId).map((member) => {
    const user = getUserById(member.userId);
    const profile = getProfileByUserId(member.userId);
    const rating = profile ? getRatingByProfileId(profile.id) : null;

    return {
      id: member.id,
      userId: member.userId,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: member.role,
      rating: rating ? { score: rating.score } : null,
    };
  });
}

function listTeams(query = {}) {
  return teams
    .filter((team) => {
      if (query.role && !team.requiredRoles.includes(query.role)) return false;
      if (query.stack) {
        const stackTokens = String(query.stack)
          .split(',')
          .map((token) => token.trim().toLowerCase())
          .filter(Boolean);
        const teamStack = team.stack.map((value) => value.toLowerCase());
        if (!stackTokens.every((token) => teamStack.includes(token))) return false;
      }
      if (query.hackathon && team.hackathonName !== query.hackathon) return false;
      return true;
    })
      .map((team) => {
        const author = getUserById(team.authorId);
        const membersCount = getTeamMembers(team.id).length;

        return {
          id: team.id,
          name: team.name,
          description: team.description,
          hackathonName: team.hackathonName,
          requiredRoles: clone(team.requiredRoles),
          stack: clone(team.stack),
          slotsOpen: team.slotsOpen,
          author: author
            ? {
                userId: author.id,
                displayName: author.displayName,
                avatarUrl: author.avatarUrl,
                isPro: Boolean(author.isPro),
              }
            : null,
          membersCount,
          isActive: team.isActive,
        };
      })
      .sort((left, right) => {
        const leftBoost = Number(Boolean(left.author?.isPro)) + Number(Boolean(left.isActive));
        const rightBoost = Number(Boolean(right.author?.isPro)) + Number(Boolean(right.isActive));

        if (rightBoost !== leftBoost) {
          return rightBoost - leftBoost;
        }

        if (right.slotsOpen !== left.slotsOpen) {
          return right.slotsOpen - left.slotsOpen;
        }

        return right.membersCount - left.membersCount;
      });
}

function getTeamById(id) {
  const team = teams.find((item) => item.id === id) || null;
  if (!team) {
    return null;
  }

  return {
    ...clone(team),
      author: getUserById(team.authorId)
        ? {
            userId: getUserById(team.authorId).id,
            displayName: getUserById(team.authorId).displayName,
            avatarUrl: getUserById(team.authorId).avatarUrl,
            isPro: Boolean(getUserById(team.authorId).isPro),
          }
        : null,
    members: getTeamMembers(team.id),
  };
}

async function createTeam(authorId, payload) {
  const team = {
    id: `team-${randomUUID()}`,
    authorId,
    name: payload.name,
    description: payload.description,
    hackathonName: payload.hackathonName,
    requiredRoles: payload.requiredRoles,
    minRating: payload.minRating || null,
    stack: payload.stack,
    slotsOpen: payload.slotsOpen,
    isActive: payload.isActive ?? true,
    status: payload.status || 'active',
    updatedAt: nowIso(),
    deletedAt: null,
    createdAt: nowIso(),
  };

  teams.push(team);
  await persistTeam(team);
  return clone(team);
}

async function updateTeam(teamId, payload) {
  const team = teams.find((item) => item.id === teamId);
  if (!team) {
    return null;
  }

  Object.assign(team, {
    ...payload,
    updatedAt: nowIso(),
  });

  await persistTeam(team);
  return clone(team);
}

function getApplicationView(application) {
  const applicant = getUserById(application.applicantId);
  const profile = getProfileByUserId(application.applicantId);
  const rating = profile ? getRatingByProfileId(profile.id) : null;
  const team = getTeamById(application.teamId);

  return {
    id: application.id,
    team: team
      ? {
          id: team.id,
          name: team.name,
          hackathonName: team.hackathonName,
        }
      : null,
    applicant: applicant
      ? {
          id: applicant.id,
          displayName: applicant.displayName,
          avatarUrl: applicant.avatarUrl,
          telegramUsername: application.status === 'accepted' ? profile?.telegramUsername || null : null,
          rating: rating ? { score: rating.score } : null,
        }
      : null,
    message: application.message,
    status: application.status,
    viewedAt: application.viewedAt,
    createdAt: application.createdAt,
  };
}

function listApplicationsForUser(userId) {
  const incoming = applications.filter((application) => {
    const team = teams.find((item) => item.id === application.teamId);
    return team?.authorId === userId;
  });

  const outgoing = applications.filter((application) => application.applicantId === userId);

  return {
    incoming: incoming.map(getApplicationView),
    outgoing: outgoing.map(getApplicationView),
  };
}

async function createApplication({ applicantId, teamId, message }) {
  const team = teams.find((item) => item.id === teamId);
  if (!team) {
    const error = new Error('Team not found.');
    error.statusCode = 404;
    error.code = 'TEAM_NOT_FOUND';
    throw error;
  }

  if (!team.isActive || team.status !== 'active') {
    const error = new Error('Team is not accepting applications.');
    error.statusCode = 409;
    error.code = 'TEAM_NOT_ACCEPTING_APPLICATIONS';
    throw error;
  }

  if (team.authorId === applicantId) {
    const error = new Error('Team author cannot apply to own team.');
    error.statusCode = 409;
    error.code = 'CANNOT_APPLY_TO_OWN_TEAM';
    throw error;
  }

  const existing = applications.find(
    (application) => application.applicantId === applicantId && application.teamId === teamId
  );

  if (existing) {
    const error = new Error('Application already exists for this team.');
    error.statusCode = 409;
    error.code = 'APPLICATION_ALREADY_EXISTS';
    throw error;
  }

  const application = {
    id: `app-${randomUUID()}`,
    applicantId,
    teamId,
    message: message || '',
    status: 'pending',
    viewedAt: null,
    updatedAt: nowIso(),
    createdAt: nowIso(),
  };

  applications.push(application);
  await persistApplication(application);
  return getApplicationView(application);
}

async function updateApplicationStatus(applicationId, userId, status) {
  const application = applications.find((item) => item.id === applicationId);
  if (!application) {
    return { error: 'not_found' };
  }

  const team = teams.find((item) => item.id === application.teamId);
  if (!team || team.authorId !== userId) {
    return { error: 'forbidden' };
  }

  application.status = status;
  application.viewedAt = application.viewedAt || nowIso();
  application.updatedAt = nowIso();

  if (status === 'accepted') {
    const memberExists = teamMembers.some(
      (member) => member.teamId === application.teamId && member.userId === application.applicantId
    );

    if (!memberExists) {
      const teamMember = {
        id: `member-${randomUUID()}`,
        teamId: application.teamId,
        userId: application.applicantId,
        role: getProfileByUserId(application.applicantId)?.role || 'participant',
        joinedAt: nowIso(),
      };

      teamMembers.push(teamMember);
      await persistTeamMember(teamMember);
    }
  }

  await persistApplication(application);
  return getApplicationView(application);
}

function inferRatingInput(profile, githubData) {
  const mergedGithubData = githubData || profile.githubData || null;
  const stackBoost = (profile.primaryStack || []).length * 2;
  const projectBoost = (profile.projectLinks || []).length * 4;
  const experienceBoost = Math.min(profile.experienceYears * 6, 24);
  const hackathonBoost = Math.min(profile.hackathonsCount * 5, 15);
  const githubBoost = mergedGithubData ? Math.min((mergedGithubData.publicRepos || 0) * 1.5, 15) : 0;
  const baseScore = 30;
  const score = Math.max(0, Math.min(100, Math.round(baseScore + stackBoost + projectBoost + experienceBoost + hackathonBoost + githubBoost)));

  const strengths = [];
  const improvements = [];

  if ((profile.primaryStack || []).length >= 2) {
    strengths.push(`Сильный стек: ${(profile.primaryStack || []).slice(0, 3).join(', ')}`);
  }

  if (profile.experienceYears >= 2) {
    strengths.push('Есть практический опыт');
  }

  if ((profile.projectLinks || []).length > 0) {
    strengths.push('Есть проекты в портфолио');
  }

  if (profile.hackathonsCount > 0) {
    strengths.push('Участвовал в хакатонах');
  }

  if ((profile.primaryStack || []).length < 3) {
    improvements.push('Добавить больше глубины в основном стеке');
  }

  if ((profile.projectLinks || []).length < 2) {
    improvements.push('Добавить ещё 1-2 проекта для портфолио');
  }

  if (profile.experienceYears < 2) {
    improvements.push('Подтянуть практический опыт');
  }

  if (!mergedGithubData) {
    improvements.push('Подключить GitHub для более точной оценки');
  }

  const roleLabel = capitalize(profile.role || 'other');
  const gradeLabel = `${capitalize(profile.claimedGrade)} ${roleLabel}`;

  return {
    score,
    grade: gradeLabel,
    roleLabel,
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    rawResponse: {
      score,
      grade: gradeLabel,
      roleLabel,
      strengths: strengths.slice(0, 3),
      improvements: improvements.slice(0, 3),
    },
  };
}

async function scoreProfile(userId, overrides = {}, aiResult = null) {
  let profile = getProfileByUserId(userId);
  if (!profile) {
    profile = await createOrGetProfileForUser(userId);
  }

  const mergedProfile = {
    ...profile,
    ...overrides,
    primaryStack: overrides.primaryStack || profile.primaryStack,
    projectLinks: overrides.projectLinks || profile.projectLinks,
    githubData: overrides.githubData || profile.githubData,
  };

  const ratingPayload = aiResult || inferRatingInput(mergedProfile, overrides.githubData);
  const rating = {
    id: `rating-${randomUUID()}`,
    profileId: profile.id,
    score: ratingPayload.score,
    grade: ratingPayload.grade,
    roleLabel: ratingPayload.roleLabel,
    strengths: ratingPayload.strengths,
    improvements: ratingPayload.improvements,
    rawResponse: ratingPayload.rawResponse || ratingPayload,
    createdAt: nowIso(),
  };

  ratings.unshift(rating);

  const storedProfile = profiles.find((item) => item.id === profile.id);
  storedProfile.lastScoredAt = rating.createdAt;
  storedProfile.updatedAt = rating.createdAt;

  await persistRating(rating);
  await persistProfile(storedProfile);
  return clone(rating);
}

async function createOrGetProfileForUser(userId) {
  const existing = getProfileByUserId(userId);
  if (existing) {
    return existing;
  }

  const profile = {
    id: `profile-${randomUUID()}`,
    userId,
    role: 'other',
    claimedGrade: 'junior',
    primaryStack: [],
    experienceYears: 0,
    hackathonsCount: 0,
    bio: '',
    projectLinks: [],
    telegramUsername: '',
    githubUrl: '',
    githubData: null,
    isPublic: true,
    lastScoredAt: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  profiles.push(profile);
  await persistProfile(profile);
  return profile;
}

async function updateProfile(userId, payload) {
  const user = getUserById(userId);
  let profile = getProfileByUserId(userId);

  if (!profile) {
    profile = await createOrGetProfileForUser(userId);
  }

  Object.assign(profile, {
    role: payload.role ?? profile.role,
    claimedGrade: payload.claimedGrade ?? profile.claimedGrade,
    primaryStack: payload.primaryStack ?? profile.primaryStack,
    experienceYears: payload.experienceYears ?? profile.experienceYears,
    hackathonsCount: payload.hackathonsCount ?? profile.hackathonsCount,
    bio: payload.bio ?? profile.bio,
    projectLinks: payload.projectLinks ?? profile.projectLinks,
    telegramUsername: payload.telegramUsername ?? profile.telegramUsername,
    githubUrl: payload.githubUrl ?? profile.githubUrl,
    isPublic: payload.isPublic ?? profile.isPublic,
    updatedAt: nowIso(),
  });

  if (user && payload.role) {
    user.updatedAt = nowIso();
    await persistUser(user);
  }

  await persistProfile(profile);
  return clone(profile);
}

async function setUserPro(userId, isPro, proExpiresAt = null) {
  const user = getUserById(userId);

  if (!user) {
    return null;
  }

  user.isPro = Boolean(isPro);
  user.proExpiresAt = user.isPro ? proExpiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;
  user.updatedAt = nowIso();

  await persistUser(user);
  return clone(user);
}

async function upsertOAuthUser({
  githubId,
  username,
  displayName,
  avatarUrl,
  email,
}) {
  const normalizedGithubId = githubId ? Number(githubId) : null;
  let user = null;

  if (normalizedGithubId) {
    user = users.find((item) => Number(item.githubId) === normalizedGithubId) || null;
  }

  if (!user && username) {
    user = users.find((item) => item.username === username) || null;
  }

  if (!user && email) {
    user = users.find((item) => item.email === email) || null;
  }

  const now = nowIso();

  if (!user) {
    user = {
      id: `user-${normalizedGithubId || randomUUID()}`,
      githubId: normalizedGithubId,
      telegramId: null,
      email: email || `${username || 'user'}@skillhub.dev`,
      username: username || `user-${normalizedGithubId || 'guest'}`,
      avatarUrl: avatarUrl || 'https://avatars.githubusercontent.com/u/1?v=4',
      displayName: displayName || username || 'GitHub User',
      isPro: false,
      proExpiresAt: null,
      userRole: 'participant',
      createdAt: now,
      updatedAt: now,
    };

    users.push(user);
  } else {
    user.githubId = normalizedGithubId ?? user.githubId;
    user.email = email || user.email;
    user.username = username || user.username;
    user.avatarUrl = avatarUrl || user.avatarUrl;
    user.displayName = displayName || user.displayName;
    user.updatedAt = now;
  }

  await persistUser(user);
  await createOrGetProfileForUser(user.id);

  return clone(user);
}

async function importGithubData(userId, githubData) {
  const profile = await createOrGetProfileForUser(userId);
  profile.githubData = githubData;
  profile.updatedAt = nowIso();

  const sortedLanguages = Object.entries(githubData?.languages || {})
    .sort((left, right) => right[1] - left[1])
    .map(([language]) => language);

  const suggestedPrimaryStack = sortedLanguages.slice(0, 3);
  const suggestedProjectLinks = (githubData?.topRepos || []).slice(0, 3).map((repo) => ({
    url: `https://github.com/example/${repo.name}`,
    title: repo.name,
    description: repo.description || repo.primaryLanguage || 'GitHub repository',
  }));

  await persistProfile(profile);
  return {
    suggestedPrimaryStack,
    suggestedProjectLinks,
    githubData: clone(githubData),
    profile: clone(profile),
  };
}

function getProfileScoreLimitWindow(isPro) {
  return isPro ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
}

function getRateLimitStatus(userId) {
  const profile = getProfileByUserId(userId);
  if (!profile?.lastScoredAt) {
    return { allowed: true, nextAllowedAt: null };
  }

  const user = getUserById(userId);
  const windowMs = getProfileScoreLimitWindow(user?.isPro);
  const lastScoredAt = new Date(profile.lastScoredAt).getTime();
  const nextAllowedAtMs = lastScoredAt + windowMs;

  if (Date.now() >= nextAllowedAtMs) {
    return { allowed: true, nextAllowedAt: null };
  }

  return {
    allowed: false,
    nextAllowedAt: new Date(nextAllowedAtMs).toISOString(),
  };
}

function getAuthMe(userId) {
  return buildOwnProfile(userId, getUserById(userId));
}

async function upgradeUserToPro(userId, days = 30) {
  const user = getUserById(userId);
  if (!user) {
    return null;
  }

  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  user.isPro = true;
  user.proExpiresAt = expiresAt;
  user.updatedAt = nowIso();

  await persistUser(user);
  return {
    id: user.id,
    isPro: user.isPro,
    proExpiresAt: user.proExpiresAt,
  };
}

module.exports = {
  demoStore: {
    initializeStore,
    getUserById,
    getDefaultViewer,
    getProfileByUserId,
    getRatingByProfileId,
    getRatingByUserId,
    buildPublicProfile,
    buildOwnProfile,
    buildUserSummary,
    getRatingHistoryByUserId,
    getScoreJobStatus,
    listUsers,
    listTeams,
    getTeamById,
    createTeam,
    updateTeam,
    listApplicationsForUser,
    createApplication,
    updateApplicationStatus,
    scoreProfile,
    updateProfile,
    setUserPro,
    upsertOAuthUser,
    importGithubData,
    createOrGetProfileForUser,
    getRateLimitStatus,
    getAuthMe,
    upgradeUserToPro,
  },
};
