api.getSchedule = function(data, callback) {
  const options = {
    table: 'schedule',
    search: `class_id=${data.classId}`
  };

  api.db.mysql.query(options, (err, schedule) => {
    if (err) {
      application.log.error(err);
      return;
    }

    api.getTimetable((timetable) => {
      callback({ schedule, timetable });
    });
  });
}
