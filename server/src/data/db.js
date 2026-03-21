const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const { seedData } = require('../../../scripts/seed');
const { env } = require('../config/env');

let pool = null;
let databaseReady = false;

function isDatabaseConfigured() {
  return Boolean(env.DATABASE_URL);
}

function isDatabaseReady() {
  return databaseReady;
}

function setDatabaseReady(value) {
  databaseReady = Boolean(value);
}

function getPool() {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (!pool) {
    const databaseUrl = new URL(env.DATABASE_URL);
    const useSsl =
      databaseUrl.searchParams.get('sslmode') === 'require' ||
      !['localhost', '127.0.0.1'].includes(databaseUrl.hostname);

    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    });

    pool.on('error', (error) => {
      databaseReady = false;
      console.error('PostgreSQL pool error:', error?.message || error);
    });
  }

  return pool;
}

async function query(text, params = []) {
  const activePool = getPool();

  if (!activePool || !databaseReady) {
    throw new Error('Database is not configured.');
  }

  return activePool.query(text, params);
}

async function closePool() {
  if (!pool) {
    return;
  }

  const activePool = pool;
  pool = null;
  setDatabaseReady(false);
  await activePool.end().catch(() => {});
}

async function pingDatabase() {
  if (!isDatabaseConfigured()) {
    return {
      configured: false,
      ready: false,
      healthy: false,
      message: 'DATABASE_URL is not set.',
    };
  }

  if (!isDatabaseReady()) {
    return {
      configured: true,
      ready: false,
      healthy: false,
      message: 'Database bootstrap has not completed.',
    };
  }

  try {
    await query('SELECT 1 AS ok');
    return {
      configured: true,
      ready: true,
      healthy: true,
      message: 'Database connection is healthy.',
    };
  } catch (error) {
    return {
      configured: true,
      ready: false,
      healthy: false,
      message: error?.message || 'Database healthcheck failed.',
    };
  }
}

function serializeJson(value) {
  return value == null ? null : JSON.stringify(value);
}

async function insertSeedRows(client, table, columns, rows) {
  if (!rows.length) {
    return;
  }

  const columnList = columns.join(', ');
  const placeholderList = columns.map((_, index) => `$${index + 1}`).join(', ');
  const conflictTarget = table === 'applications' ? '(applicant_id, team_id)' : '(id)';
  const updateAssignments = columns
    .filter((column) => column !== 'id')
    .map((column) => `${column} = EXCLUDED.${column}`)
    .join(', ');

  const statement = `INSERT INTO ${table} (${columnList}) VALUES (${placeholderList}) ON CONFLICT ${conflictTarget} DO UPDATE SET ${updateAssignments}`;

  for (const row of rows) {
    await client.query(statement, columns.map((column) => row[column]));
  }
}

async function seedDatabase(client) {
  await insertSeedRows(client, 'users', ['id', 'github_id', 'telegram_id', 'email', 'username', 'avatar_url', 'display_name', 'is_pro', 'pro_expires_at', 'user_role', 'created_at', 'updated_at'], seedData.users.map((item) => ({
    id: item.id,
    github_id: item.githubId,
    telegram_id: item.telegramId,
    email: item.email,
    username: item.username,
    avatar_url: item.avatarUrl,
    display_name: item.displayName,
    is_pro: item.isPro,
    pro_expires_at: item.proExpiresAt,
    user_role: item.userRole,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  })));

  await insertSeedRows(client, 'profiles', ['id', 'user_id', 'role', 'claimed_grade', 'primary_stack', 'experience_years', 'hackathons_count', 'bio', 'project_links', 'telegram_username', 'github_url', 'github_data', 'is_public', 'last_scored_at', 'created_at', 'updated_at'], seedData.profiles.map((item) => ({
    id: item.id,
    user_id: item.userId,
    role: item.role,
    claimed_grade: item.claimedGrade,
    primary_stack: serializeJson(item.primaryStack),
    experience_years: item.experienceYears,
    hackathons_count: item.hackathonsCount,
    bio: item.bio,
    project_links: serializeJson(item.projectLinks),
    telegram_username: item.telegramUsername,
    github_url: item.githubUrl,
    github_data: serializeJson(item.githubData),
    is_public: item.isPublic,
    last_scored_at: item.lastScoredAt,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  })));

  await insertSeedRows(client, 'ratings', ['id', 'profile_id', 'score', 'grade', 'role_label', 'strengths', 'improvements', 'raw_response', 'created_at'], seedData.ratings.map((item) => ({
    id: item.id,
    profile_id: item.profileId,
    score: item.score,
    grade: item.grade,
    role_label: item.roleLabel,
    strengths: serializeJson(item.strengths),
    improvements: serializeJson(item.improvements),
    raw_response: serializeJson(item.rawResponse),
    created_at: item.createdAt,
  })));

  await insertSeedRows(client, 'teams', ['id', 'author_id', 'name', 'description', 'hackathon_name', 'required_roles', 'min_rating', 'stack', 'slots_open', 'is_active', 'status', 'updated_at', 'deleted_at', 'created_at'], seedData.teams.map((item) => ({
    id: item.id,
    author_id: item.authorId,
    name: item.name,
    description: item.description,
    hackathon_name: item.hackathonName,
    required_roles: serializeJson(item.requiredRoles),
    min_rating: item.minRating,
    stack: serializeJson(item.stack),
    slots_open: item.slotsOpen,
    is_active: item.isActive,
    status: item.status,
    updated_at: item.updatedAt,
    deleted_at: item.deletedAt,
    created_at: item.createdAt,
  })));

  await insertSeedRows(client, 'team_members', ['id', 'team_id', 'user_id', 'role', 'joined_at'], seedData.teamMembers.map((item) => ({
    id: item.id,
    team_id: item.teamId,
    user_id: item.userId,
    role: item.role,
    joined_at: item.joinedAt,
  })));

  await insertSeedRows(client, 'applications', ['id', 'applicant_id', 'team_id', 'message', 'status', 'viewed_at', 'created_at', 'updated_at'], seedData.applications.map((item) => ({
    id: item.id,
    applicant_id: item.applicantId,
    team_id: item.teamId,
    message: item.message,
    status: item.status,
    viewed_at: item.viewedAt,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  })));
}

async function bootstrapDatabase() {
  if (!isDatabaseConfigured()) {
    setDatabaseReady(false);
    return { enabled: false, seeded: false };
  }

  const activePool = getPool();
  const client = await activePool.connect();

  try {
    await client.query('BEGIN');
    const schemaPath = path.join(__dirname, '..', '..', 'sql', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);

    const existingUsersResult = await client.query('SELECT COUNT(*)::int AS count FROM users');
    const shouldSeed = existingUsersResult.rows[0].count === 0;

    if (shouldSeed) {
      await seedDatabase(client);
    }

    await client.query('COMMIT');
    setDatabaseReady(true);
    return { enabled: true, seeded: shouldSeed };
  } catch (error) {
    await client.query('ROLLBACK');
    setDatabaseReady(false);
    throw error;
  } finally {
    client.release();
  }
}

async function loadSnapshot() {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const [usersResult, profilesResult, ratingsResult, teamsResult, teamMembersResult, applicationsResult] = await Promise.all([
    query('SELECT * FROM users ORDER BY created_at ASC, id ASC'),
    query('SELECT * FROM profiles ORDER BY created_at ASC, id ASC'),
    query('SELECT * FROM ratings ORDER BY created_at DESC, id DESC'),
    query('SELECT * FROM teams ORDER BY created_at ASC, id ASC'),
    query('SELECT * FROM team_members ORDER BY joined_at ASC, id ASC'),
    query('SELECT * FROM applications ORDER BY created_at ASC, id ASC'),
  ]);

  return {
    users: usersResult.rows.map((row) => ({
      id: row.id,
      githubId: row.github_id ?? null,
      telegramId: row.telegram_id ?? null,
      email: row.email,
      username: row.username,
      avatarUrl: row.avatar_url,
      displayName: row.display_name,
      isPro: row.is_pro,
      proExpiresAt: row.pro_expires_at,
      userRole: row.user_role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    profiles: profilesResult.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      role: row.role,
      claimedGrade: row.claimed_grade,
      primaryStack: row.primary_stack || [],
      experienceYears: row.experience_years,
      hackathonsCount: row.hackathons_count,
      bio: row.bio,
      projectLinks: row.project_links || [],
      telegramUsername: row.telegram_username,
      githubUrl: row.github_url,
      githubData: row.github_data || null,
      isPublic: row.is_public,
      lastScoredAt: row.last_scored_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    ratings: ratingsResult.rows.map((row) => ({
      id: row.id,
      profileId: row.profile_id,
      score: row.score,
      grade: row.grade,
      roleLabel: row.role_label,
      strengths: row.strengths || [],
      improvements: row.improvements || [],
      rawResponse: row.raw_response || {},
      createdAt: row.created_at,
    })),
    teams: teamsResult.rows.map((row) => ({
      id: row.id,
      authorId: row.author_id,
      name: row.name,
      description: row.description,
      hackathonName: row.hackathon_name,
      requiredRoles: row.required_roles || [],
      minRating: row.min_rating ?? null,
      stack: row.stack || [],
      slotsOpen: row.slots_open,
      isActive: row.is_active,
      status: row.status,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
      createdAt: row.created_at,
    })),
    teamMembers: teamMembersResult.rows.map((row) => ({
      id: row.id,
      teamId: row.team_id,
      userId: row.user_id,
      role: row.role,
      joinedAt: row.joined_at,
    })),
    applications: applicationsResult.rows.map((row) => ({
      id: row.id,
      applicantId: row.applicant_id,
      teamId: row.team_id,
      message: row.message,
      status: row.status,
      viewedAt: row.viewed_at,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    })),
  };
}

module.exports = {
  bootstrapDatabase,
  closePool,
  isDatabaseConfigured,
  isDatabaseReady,
  loadSnapshot,
  pingDatabase,
  setDatabaseReady,
  query,
};
