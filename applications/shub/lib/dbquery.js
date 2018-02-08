api.db.mysql.query = function(options, callback) {
  const query = `${options.method || 'SELECT'} ` +
                `${options.query || '*'} ` +
                `FROM ${options.table} ` +
                `${options.search ? 'WHERE ' + options.search : ''}`;
  this.connection.query(query, callback);
}








































// api.db.mysql.getSchedule = function(data, callback) {
//
//   callback(null, data);
// };
