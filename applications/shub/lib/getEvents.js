api.getEvents = function(data, callback) {
  const options = {
    query: '*',
    table: 'events',
    search: `class_id=${data.classId}`,
    from: true
  };

  this.db.mysql.query(options, (err, result) => {
    if (err) {
      application.log.error(err);
      return;
    }

    callback(result);
  });
};
