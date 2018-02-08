api.getEvents = function(data, callback) {
  const options = {
    table: 'events',
    search: `class_id=${data.classId}`
  };

  api.db.mysql.query(options, (err, result) => {
    if (err) {
      application.log.error(err);
      return;
    }

    callback(result);
  });
}
