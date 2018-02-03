'use strict';

const uuidv4 = require('uuid/v4');

const generateSessionId = (sessions) => {
  const session = uuidv4();
  sessions.add(session);
  return session;
};

module.exports = {
  generateSessionId
};
