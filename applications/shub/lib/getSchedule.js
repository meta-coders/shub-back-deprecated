api.getSchedule = function(data, callback) {
  const options = {
    table: 'schedule',
    query: 'schedule.weekday, schedule.lesson, schedule.subject,' +
           ' schedule.cabinet, teachers.name AS teacher_name',
    join: 'LEFT JOIN teachers ON teachers.id=schedule.teacher_id',
    search: `class_id=${data.classId}`,
    from: true
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
};
