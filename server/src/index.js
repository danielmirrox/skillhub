const { createApp } = require('./app');
const { env } = require('./config/env');

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`SkillHub API listening on port ${env.PORT}`);
});
