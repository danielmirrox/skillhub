#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const net = require('net');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const serverDir = path.join(repoRoot, 'server');
const clientDir = path.join(repoRoot, 'client');
const clientDistDir = path.join(clientDir, 'dist');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const { Pool } = require(path.join(serverDir, 'node_modules', 'pg'));
const { chromium } = require(path.join(serverDir, 'node_modules', 'playwright-core'));

const { seedData } = require('./seed');

const demoUser = {
  id: 'user-captain',
  username: 'captainpro',
  displayName: 'Артем Капустин',
  avatarUrl: 'https://avatars.githubusercontent.com/u/4?v=4',
  isPro: true,
  proExpiresAt: '2026-04-21T08:00:00Z',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fail(message) {
  throw new Error(message);
}

function runCommandAndCapture(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      shell: false,
      windowsHide: true,
      ...options,
    });

    let stdout = '';
    let stderr = '';

    if (child.stdout) {
      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(
        new Error(
          `Command failed: ${command} ${args.join(' ')}\nExit code: ${code}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`,
        ),
      );
    });
  });
}

function loadRuntimeEnv() {
  return require(path.join(serverDir, 'src', 'config', 'env')).env;
}

function parseExecutablePath(output) {
  const firstLine = String(output || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine || null;
}

function getPostgresExecutables() {
  const explicitBinDir = process.env.POSTGRES_BIN_DIR || process.env.PG_BINDIR || '';
  const initdbOverride = process.env.POSTGRES_INITDB_PATH || '';
  const postgresOverride = process.env.POSTGRES_POSTGRES_PATH || '';

  if (initdbOverride && postgresOverride) {
    return { initdb: initdbOverride, postgres: postgresOverride };
  }

  if (explicitBinDir) {
    const candidateInitdb = path.join(explicitBinDir, process.platform === 'win32' ? 'initdb.exe' : 'initdb');
    const candidatePostgres = path.join(explicitBinDir, process.platform === 'win32' ? 'postgres.exe' : 'postgres');

    if (fs.existsSync(candidateInitdb) && fs.existsSync(candidatePostgres)) {
      return { initdb: candidateInitdb, postgres: candidatePostgres };
    }
  }

  if (process.platform !== 'win32') {
    const initdbResolved = parseExecutablePath(spawnSync('which', ['initdb'], { encoding: 'utf8' }).stdout);
    const postgresResolved = parseExecutablePath(spawnSync('which', ['postgres'], { encoding: 'utf8' }).stdout);

    if (initdbResolved && postgresResolved) {
      return { initdb: initdbResolved, postgres: postgresResolved };
    }
  }

  const candidates = [
    'C:\\Program Files\\PostgreSQL\\18\\bin',
    'C:\\Program Files (x86)\\PostgreSQL\\18\\bin',
    'C:\\Program Files\\PostgreSQL\\17\\bin',
    'C:\\Program Files (x86)\\PostgreSQL\\17\\bin',
  ];

  for (const candidate of candidates) {
    const initdbPath = path.join(candidate, 'initdb.exe');
    const postgresPath = path.join(candidate, 'postgres.exe');

    if (fs.existsSync(initdbPath) && fs.existsSync(postgresPath)) {
      return { initdb: initdbPath, postgres: postgresPath };
    }
  }

  return null;
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('Failed to allocate a free port.')));
        return;
      }

      const port = address.port;
      server.close(() => resolve(port));
    });
  });
}

let serverModules = null;
function loadServerModules() {
  if (!serverModules) {
    serverModules = {
      createApp: require(path.join(serverDir, 'src', 'app')).createApp,
      demoStore: require(path.join(serverDir, 'src', 'data', 'demoStore')).demoStore,
      closePool: require(path.join(serverDir, 'src', 'data', 'db')).closePool,
      pingDatabase: require(path.join(serverDir, 'src', 'data', 'db')).pingDatabase,
      query: require(path.join(serverDir, 'src', 'data', 'db')).query,
    };
  }

  return serverModules;
}

async function waitFor(predicate, timeoutMs = 30000, stepMs = 250) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const value = await predicate();
      if (value) {
        return value;
      }
    } catch {
      // retry until timeout
    }

    await sleep(stepMs);
  }

  return null;
}

async function startTempPostgresCluster() {
  const executables = getPostgresExecutables();
  if (!executables) {
    fail('Could not find PostgreSQL binaries (initdb/postgres). Set POSTGRES_BIN_DIR, POSTGRES_INITDB_PATH and POSTGRES_POSTGRES_PATH, or put initdb/postgres on PATH.');
  }

  const clusterRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'skillhub-pg-'));
  const dataDir = path.join(clusterRoot, 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  await runCommandAndCapture(executables.initdb, ['-A', 'trust', '-U', 'postgres', '-D', dataDir], {
    cwd: clusterRoot,
    env: {
      ...process.env,
      PGCLIENTENCODING: 'UTF8',
    },
  });

  const port = await findFreePort();
  const postgresProcess = spawn(executables.postgres, ['-D', dataDir, '-p', String(port), '-h', '127.0.0.1'], {
    shell: false,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PGCLIENTENCODING: 'UTF8',
    },
  });

  let logs = '';
  if (postgresProcess.stdout) {
    postgresProcess.stdout.on('data', (chunk) => {
      logs += chunk.toString();
    });
  }
  if (postgresProcess.stderr) {
    postgresProcess.stderr.on('data', (chunk) => {
      logs += chunk.toString();
    });
  }

  const adminConnectionString = `postgresql://postgres:@127.0.0.1:${port}/postgres`;
  const started = await waitFor(async () => {
    try {
      const pool = new Pool({ connectionString: adminConnectionString });
      await pool.query('SELECT 1');
      await pool.end();
      return true;
    } catch {
      return null;
    }
  }, 30000);

  if (!started) {
    await stopTempPostgresCluster({ postgresProcess, clusterRoot });
    fail(`Temp PostgreSQL did not start.\n${logs}`);
  }

  const adminPool = new Pool({ connectionString: adminConnectionString });
  try {
    await adminPool.query('CREATE DATABASE skillhub');
  } catch (error) {
    if (error.code !== '42P04') {
      await adminPool.end();
      await stopTempPostgresCluster({ postgresProcess, clusterRoot });
      throw error;
    }
  } finally {
    await adminPool.end().catch(() => {});
  }

  return {
    postgresProcess,
    clusterRoot,
    databaseUrl: `postgresql://postgres:@127.0.0.1:${port}/skillhub`,
    adminConnectionString,
  };
}

async function stopTempPostgresCluster(cluster) {
  if (!cluster) {
    return;
  }

  const { postgresProcess, clusterRoot } = cluster;
  if (postgresProcess && !postgresProcess.killed) {
    await new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) {
          return;
        }
        done = true;
        resolve();
      };

      const timer = setTimeout(() => {
        try {
          if (process.platform === 'win32') {
            spawnSync('taskkill', ['/PID', String(postgresProcess.pid), '/T', '/F'], { windowsHide: true });
          } else {
            postgresProcess.kill('SIGTERM');
          }
        } catch {
          // ignore
        }

        finish();
      }, 3000);

      postgresProcess.once('exit', () => {
        clearTimeout(timer);
        finish();
      });

      try {
        postgresProcess.kill();
      } catch {
        clearTimeout(timer);
        finish();
      }
    });
  }

  fs.rmSync(clusterRoot, { recursive: true, force: true });
}

function getBrowserPath() {
  if (process.env.SMOKE_BROWSER && fs.existsSync(process.env.SMOKE_BROWSER)) {
    return process.env.SMOKE_BROWSER;
  }

  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function startStaticServer(rootDir) {
  const mimeTypes = new Map([
    ['.html', 'text/html; charset=utf-8'],
    ['.js', 'text/javascript; charset=utf-8'],
    ['.css', 'text/css; charset=utf-8'],
    ['.svg', 'image/svg+xml'],
    ['.json', 'application/json; charset=utf-8'],
    ['.ico', 'image/x-icon'],
    ['.png', 'image/png'],
    ['.jpg', 'image/jpeg'],
    ['.jpeg', 'image/jpeg'],
    ['.webp', 'image/webp'],
    ['.map', 'application/json; charset=utf-8'],
  ]);

  const server = http.createServer((req, res) => {
    const requestUrl = new URL(req.url || '/', 'http://127.0.0.1');
    let pathname = decodeURIComponent(requestUrl.pathname);

    if (pathname === '/') {
      pathname = '/index.html';
    }

    let filePath = path.join(rootDir, pathname);
    const normalizedRoot = path.normalize(rootDir + path.sep);
    filePath = path.normalize(filePath);

    const shouldServeIndex = !path.extname(pathname);

    if (!filePath.startsWith(normalizedRoot) || (shouldServeIndex && !fs.existsSync(filePath))) {
      filePath = path.join(rootDir, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', mimeTypes.get(ext) || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to start static server.'));
        return;
      }

      resolve({
        server,
        port: address.port,
        baseUrl: `http://127.0.0.1:${address.port}`,
      });
    });
  });
}

function buildSmokeUrl(baseUrl, nextPath) {
  const params = new URLSearchParams({
    next: nextPath,
    userId: demoUser.id,
    username: demoUser.username,
    displayName: demoUser.displayName,
    avatarUrl: demoUser.avatarUrl,
    isPro: 'true',
    proExpiresAt: demoUser.proExpiresAt,
  });

  return `${baseUrl}/smoke.html?${params.toString()}`;
}

async function verifyDatabase() {
  const { pingDatabase, query } = loadServerModules();
  const health = await pingDatabase();
  if (!health.healthy) {
    fail(`PostgreSQL is not healthy: ${health.message}`);
  }

  const counts = {
    users: seedData.users.length,
    profiles: seedData.profiles.length,
    ratings: seedData.ratings.length,
    teams: seedData.teams.length,
    teamMembers: seedData.teamMembers.length,
    applications: seedData.applications.length,
  };

  const [usersResult, profilesResult, ratingsResult, teamsResult, membersResult, applicationsResult] = await Promise.all([
    query('SELECT COUNT(*)::int AS count FROM users'),
    query('SELECT COUNT(*)::int AS count FROM profiles'),
    query('SELECT COUNT(*)::int AS count FROM ratings'),
    query('SELECT COUNT(*)::int AS count FROM teams'),
    query('SELECT COUNT(*)::int AS count FROM team_members'),
    query('SELECT COUNT(*)::int AS count FROM applications'),
  ]);

  const actualCounts = {
    users: usersResult.rows[0].count,
    profiles: profilesResult.rows[0].count,
    ratings: ratingsResult.rows[0].count,
    teams: teamsResult.rows[0].count,
    teamMembers: membersResult.rows[0].count,
    applications: applicationsResult.rows[0].count,
  };

  for (const [key, expected] of Object.entries(counts)) {
    const actual = actualCounts[key];
    if (actual < expected) {
      fail(`Table "${key}" has ${actual} rows, expected at least ${expected}.`);
    }
  }

  const requiredRows = [
    ['users', "SELECT 1 FROM users WHERE id = $1", [demoUser.id], 'user-captain'],
    ['profiles', "SELECT 1 FROM profiles WHERE user_id = $1", [demoUser.id], 'profile for user-captain'],
    ['teams', "SELECT 1 FROM teams WHERE id = $1", ['team-ai-hub'], 'team-ai-hub'],
    ['teams', "SELECT 1 FROM teams WHERE id = $1", ['team-viribus'], 'team-viribus'],
    ['applications', "SELECT 1 FROM applications WHERE applicant_id = $1 AND team_id = $2", ['user-denis', 'team-viribus'], 'application user-denis -> team-viribus'],
  ];

  for (const [label, sql, params, description] of requiredRows) {
    const result = await query(sql, params);
    if (result.rowCount === 0) {
      fail(`Missing required seeded row: ${description} in ${label}.`);
    }
  }

  return actualCounts;
}

async function startApiServer() {
  const { createApp, demoStore, pingDatabase } = loadServerModules();
  await demoStore.initializeStore();

  const health = await pingDatabase();
  if (!health.healthy) {
    fail(`Database fallback is not acceptable for smoke: ${health.message}`);
  }

  const app = createApp();
  const server = app.listen(0, '127.0.0.1');

  const address = await new Promise((resolve, reject) => {
    server.on('error', reject);
    server.on('listening', () => {
      resolve(server.address());
    });
  });

  if (!address || typeof address === 'string') {
    throw new Error('Failed to start API server.');
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;
  const ready = await waitFor(async () => {
    const response = await fetch(`${baseUrl}/health`);
    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return payload?.database?.healthy ? payload : null;
  }, 30000);

  if (!ready) {
    throw new Error('API healthcheck did not become ready.');
  }

  return { server, baseUrl };
}

async function verifyApi(baseUrl) {
  const headers = {
    'x-demo-user-id': demoUser.id,
  };

  const [healthResponse, usersResponse, teamsResponse, applicationsResponse] = await Promise.all([
    fetch(`${baseUrl}/health`),
    fetch(`${baseUrl}/api/v1/users?limit=12&page=1`, { headers }),
    fetch(`${baseUrl}/api/v1/teams`, { headers }),
    fetch(`${baseUrl}/api/v1/applications`, { headers }),
  ]);

  if (!healthResponse.ok) {
    fail(`Health endpoint returned ${healthResponse.status}.`);
  }

  const health = await healthResponse.json();
  if (!health.database?.healthy) {
    fail('Health endpoint does not report a healthy database.');
  }

  const users = await usersResponse.json();
  const teams = await teamsResponse.json();
  const applications = await applicationsResponse.json();

  if (!Array.isArray(users.items) || users.items.length === 0) {
    fail('Users endpoint returned an empty list.');
  }

  if (!Array.isArray(teams.items) || teams.items.length === 0) {
    fail('Teams endpoint returned an empty list.');
  }

  if (!Array.isArray(applications.incoming) || !Array.isArray(applications.outgoing)) {
    fail('Applications endpoint returned an invalid payload.');
  }

  if (applications.incoming.length === 0) {
    fail('Applications endpoint returned no incoming items for the smoke user.');
  }

  return {
    firstUserName: users.items[0].displayName,
    firstTeamName: teams.items[0].name,
    incomingApplicationName: applications.incoming[0].applicant?.displayName ?? null,
    incomingTeamName: applications.incoming[0].team?.name ?? null,
  };
}

async function verifyYandexGptSmoke(baseUrl) {
  const runtimeEnv = loadRuntimeEnv();
  const requireLiveYandex = ['1', 'true', 'yes'].includes(String(process.env.SMOKE_YANDEXGPT || '').toLowerCase());

  if (!requireLiveYandex) {
    console.log('Skipping YandexGPT smoke. Set SMOKE_YANDEXGPT=1 to require a live YandexGPT call.');
    return { skipped: true };
  }

  const hasYandexAuth =
    Boolean(runtimeEnv.YANDEXGPT_SA_KEY_PATH) ||
    Boolean(runtimeEnv.YANDEXGPT_IAM_TOKEN) ||
    Boolean(runtimeEnv.YANDEXGPT_API_KEY);
  const hasYandexModel =
    Boolean(runtimeEnv.YANDEXGPT_MODEL_URI) ||
    Boolean(runtimeEnv.YANDEXGPT_FOLDER_ID) ||
    Boolean(runtimeEnv.YANDEXGPT_MODEL);

  if (!hasYandexAuth || !hasYandexModel) {
    fail('YandexGPT smoke is enabled, but Yandex auth or model config is missing.');
  }

  const { demoStore } = loadServerModules();
  const smokeUser = await demoStore.upsertOAuthUser({
    githubId: 909090,
    username: 'smoke-yandex',
    displayName: 'Smoke YandexGPT',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
    email: 'smoke-yandex@skillhub.dev',
  });

  await demoStore.setUserPro(smokeUser.id, true);
  await demoStore.updateProfile(smokeUser.id, {
    role: 'backend',
    claimedGrade: 'middle',
    primaryStack: ['Node.js', 'PostgreSQL', 'TypeScript'],
    experienceYears: 3,
    hackathonsCount: 4,
    bio: 'Smoke profile for live YandexGPT verification.',
    projectLinks: [
      {
        url: 'https://github.com/example/skillhub',
        title: 'SkillHub',
        description: 'Hackathon matchmaking MVP',
      },
    ],
    isPublic: true,
  });

  const response = await fetch(`${baseUrl}/api/v1/profile/score`, {
    method: 'POST',
    headers: {
      'x-demo-user-id': smokeUser.id,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    fail(`YandexGPT smoke endpoint returned ${response.status}: ${JSON.stringify(payload)}`);
  }

  const rating = payload?.rating;
  const allowedRoleLabels = new Set(['Frontend', 'Backend', 'Fullstack', 'Design', 'ML', 'Mobile', 'Other']);

  if (!rating || rating.source !== 'yandexgpt') {
    fail(`YandexGPT smoke did not use the live model. Response: ${JSON.stringify(payload)}`);
  }

  if (!Number.isInteger(rating.score) || rating.score < 0 || rating.score > 100) {
    fail(`YandexGPT smoke returned invalid score: ${JSON.stringify(rating)}`);
  }

  if (!allowedRoleLabels.has(rating.roleLabel)) {
    fail(`YandexGPT smoke returned invalid roleLabel: ${JSON.stringify(rating)}`);
  }

  if (!Array.isArray(rating.strengths) || rating.strengths.length < 2 || rating.strengths.length > 5) {
    fail(`YandexGPT smoke returned invalid strengths: ${JSON.stringify(rating)}`);
  }

  if (!Array.isArray(rating.improvements) || rating.improvements.length < 2 || rating.improvements.length > 5) {
    fail(`YandexGPT smoke returned invalid improvements: ${JSON.stringify(rating)}`);
  }

  console.log(`YandexGPT smoke passed with score=${rating.score}, grade="${rating.grade}".`);

  return {
    skipped: false,
    score: rating.score,
    grade: rating.grade,
    roleLabel: rating.roleLabel,
  };
}

async function runBrowserSmoke(baseUrl, routes) {
  const browserPath = getBrowserPath();
  if (!browserPath) {
    fail('Could not find Microsoft Edge or Chrome for UI smoke checks. Set SMOKE_BROWSER to an executable path.');
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: browserPath,
    args: ['--disable-gpu', '--disable-extensions', '--no-first-run', '--no-default-browser-check'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
  });

  const page = await context.newPage();
  let currentLabel = 'unknown';

  try {
    for (const { route, expectedTexts, label } of routes) {
      currentLabel = label;
      const smokeUrl = buildSmokeUrl(baseUrl, route);
      await page.goto(smokeUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForURL((url) => url.pathname === route, { timeout: 30000 });

      for (const expectedText of expectedTexts) {
        const locator = page.getByText(expectedText, { exact: false }).first();
        await locator.waitFor({ state: 'visible', timeout: 30000 });
      }
    }
  } catch (error) {
    const screenshotPath = path.join(os.tmpdir(), `skillhub-smoke-${Date.now()}.png`);
    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.error(`Saved smoke failure screenshot to ${screenshotPath}`);
    } catch {
      // ignore screenshot errors
    }

    throw new Error(`Browser smoke for "${currentLabel}" failed: ${error.message || error}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

async function main() {
  let tempCluster = null;
  let api = null;
  let uiServer = null;

  try {
    tempCluster = await startTempPostgresCluster();
    process.env.DATABASE_URL = tempCluster.databaseUrl;
    process.env.NODE_ENV = 'test';
    serverModules = null;

    api = await startApiServer();
    console.log(`API server: ${api.baseUrl}`);

    console.log('Checking PostgreSQL seed data...');
    const tableCounts = await verifyDatabase();
    console.log(
      `Database is ready. users=${tableCounts.users}, profiles=${tableCounts.profiles}, ratings=${tableCounts.ratings}, teams=${tableCounts.teams}, team_members=${tableCounts.teamMembers}, applications=${tableCounts.applications}`,
    );

    console.log('Building client for smoke checks...');
    await runCommandAndCapture(npmCommand, ['run', 'build'], {
      cwd: clientDir,
      env: {
        ...process.env,
        VITE_API_URL: api.baseUrl,
      },
    });

    uiServer = await startStaticServer(clientDistDir);

    console.log(`UI server: ${uiServer.baseUrl}`);

    const apiData = await verifyApi(api.baseUrl);

    console.log('Checking live YandexGPT integration...');
    await verifyYandexGptSmoke(api.baseUrl);

    await runBrowserSmoke(uiServer.baseUrl, [
      {
        label: 'dashboard',
        route: '/dashboard',
        expectedTexts: [demoUser.displayName, 'Dashboard'],
      },
      {
        label: 'search',
        route: '/search',
        expectedTexts: [apiData.firstUserName, 'Поиск'],
      },
      {
        label: 'teams',
        route: '/teams',
        expectedTexts: [apiData.firstTeamName, 'Команды'],
      },
      {
        label: 'applications',
        route: '/applications',
        expectedTexts: [apiData.incomingApplicationName || apiData.incomingTeamName || 'Заявки', 'Заявки'],
      },
    ]);

    console.log('Smoke checks passed.');
  } finally {
    if (uiServer) {
      await new Promise((resolve) => uiServer.server.close(() => resolve()));
    }

    if (api) {
      await new Promise((resolve) => api.server.close(() => resolve()));
    }

    const { closePool } = loadServerModules();
    if (closePool) {
      await closePool();
    }

    if (tempCluster) {
      await stopTempPostgresCluster(tempCluster);
    }
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});
