'use strict';

const fs = require('fs');
const ERROR_LOG_PATH = './logs/errors.txt';

const error = (error) => {
  const time = new Date().toUTCString();
  const log = `${time}: ${error.message}\n`;
  fs.writeFileSync(ERROR_LOG_PATH, log, { flag: 'a' });
};

global.log = Object.assign({}, {
  error
});
