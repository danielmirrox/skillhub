const { createApp } = require('./app');
const { env } = require('./config/env');
const { demoStore } = require('./data/demoStore');

(async () => {
  try {
    const storeMode = await demoStore.initializeStore();
    const app = createApp();

    app.listen(env.PORT, () => {
      const modeLabel = storeMode.enabled ? 'postgres' : 'memory';
      console.log(`SkillHub API listening on port ${env.PORT} (${modeLabel})`);
    });
  } catch (error) {
    console.error('Failed to initialize SkillHub API:', error);
    process.exit(1);
  }
})();
