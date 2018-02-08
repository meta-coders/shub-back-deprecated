api.getTimetable = function(callback) {
  const options = { table: 'timetable' };

  api.db.mysql.query(options, (err, result) => {
    if (err) {
      application.log.error(err);
      return;
    }

    callback(result);
  });
}
