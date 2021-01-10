const fs = require('fs');
const { occEnv } = require('./occEnv');
const { dcu } = require('./dcu');

const Methods = {
  start: async () => {
    if (!occEnv.hasEnv()) {
      var { selectedEnv } = await occEnv.selector();
      var { adminUrl, appKey } = await occEnv.promptEnvInfos();

      const envFile = {
        ACTIVE_ENV: selectedEnv,
        OCC_ADMIN_URL: adminUrl,
        OCC_APP_KEY: appKey,
      };
      envFile[`OCC_${selectedEnv}_ADMIN_URL`] = adminUrl;
      envFile[`OCC_${selectedEnv}_APP_KEY`] = appKey;

      occEnv.writeEnvFile(envFile);

      if (!occEnv.hasSrc()) {
        console.log('Creating src folder...');
        occEnv.createSrc();
        console.log('Grabbing your files, please wait.');
        dcu.grab(adminUrl, appKey);
      } else {
        console.log('Your project is ready! Use -g for grabing');
      }
    } else {
      console.log('.env found, delete it and try again.');
    }
  }
}

exports.setup = Methods;