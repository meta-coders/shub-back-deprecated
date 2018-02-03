module.exports = {
  schedule: {
    weekday: 'int',
    lesson: 'int',
    class_id: 'int',
    subject: 'varchar(255)',
    cabinet: 'int',
    teacher_id: 'int'
  },

  timetable: {
    start: 'time',
    end: 'time'
  },

  classes: {
    name: 'varchar(10)'
  },

  events: {
    date: 'date',
    decription: 'text',
    class_id: 'int'
  },

  students: {
    name: 'varchar(255)',
    class_id: 'int'
  },

  teachers: {
    name: 'varchar(255)'
  }
}
