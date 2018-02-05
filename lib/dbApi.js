'use strict';

const mysql = require('mysql');

const dbApi = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shub',
  connection: null
};



dbApi.init = function() {
  this.connection = mysql.createConnection({
    host: this.host,
    user: this.user,
    password: this.password,
    database: this.database
  });
  this.connection.connect();
};


// External API
//
//


dbApi.getSchedule = function(data, cb) {
  this.checkSession(data.sessionId, (err, userId) => {
    if (err) {
      cb(err);
      return;
    }

    if (!userId) {
      cb();
      return;
    }

    const studentId = `SELECT profile_id FROM users WHERE id=${userId}`;
    const classId = `SELECT class_id FROM students WHERE id=(${studentId})`;
    let sql = 'SELECT schedule.weekday, schedule.lesson, schedule.subject, ';
    sql += 'schedule.cabinet, teachers.name AS teacher_name FROM schedule ';
    sql += 'LEFT JOIN teachers ON teachers.id=schedule.teacher_id ';
    sql += `WHERE class_id=(${classId})`;
    this.connection.query(sql, (err, schedule) => {
      if (err) {
        cb(err);
        return;
      }

      const start = 'TIME_FORMAT(start, "%H:%i") AS start';
      const end = 'TIME_FORMAT(end, "%H:%i") AS end';
      const sql = `SELECT id, ${start}, ${end} FROM timetable`;

      this.connection.query(sql, (err, timetable) => {
        if (err) {
          cb(err);
          return;
        }

        cb(null, { schedule, timetable });
      });
    });
  });
};



dbApi.getEvents = function(data, cb) {
  this.checkSession(data.sessionId, (err, userId) => {
    if (err) {
      cb(err);
      return;
    }

    if (!userId) {
      cb();
      return;
    }

    const studentId = `SELECT profile_id FROM users WHERE id=${userId}`;
    const classId = `SELECT class_id FROM students WHERE id=(${studentId})`;
    this.connection.query(classId, (err, result) => {
      if (err) {
        cb(err);
        return;
      }

      let sql = 'SELECT * FROM events ';
      sql += 'WHERE YEAR(date) = YEAR(CURRENT_DATE()) AND ';
      sql += 'MONTH(date) = MONTH(CURRENT_DATE()) AND ';
      sql += 'class_id=' + result[0].class_id;
      this.connection.query(sql, (err, events) => {
        if (err) {
          cb(err);
          return;
        }

        const eventsArray = events.map(item => (
          Object.assign(
            {},
            item,
            { date: item.date.toISOString().split('T')[0] }
          )
        ));

        cb(null, eventsArray);
      });
    });
  });
};


dbApi.getHomework = function(data, cb) {
  this.checkSession(data.sessionId, (err, userId) => {
    if (err) {
      cb(err);
      return;
    }

    if (!userId) {
      cb();
      return;
    }
    const studentId = `SELECT profile_id FROM users WHERE id=${userId}`;
    const classId = `SELECT class_id FROM students WHERE id=(${studentId})`;
    const sql = 'SELECT homework.id, homework.description, lessons.date,' +
    'schedule.subject FROM homework JOIN lessons ON ' +
    'homework.lesson_id=lessons.id JOIN schedule ON ' +
    `schedule.id=lessons.schedule_id WHERE homework.class_id=(${classId})`;
    this.connection.query(sql,
      (err, homework) => {
        if (err) {
          cb(err);
          return;
        }

        const homeworkArray = homework.map(item => (
          Object.assign(
            { done: false },
            item,
            { date: item.date.toISOString().split('T')[0] }
          )
        ));

        cb(null, homeworkArray);
      }
    );
  });
};


// Internal API
//
//
dbApi.authenticate = function(login, pass, cb) {
  this.connection.query(`SELECT MD5("${pass}") AS pass`, (err, md5) => {

    if (err) {
      cb(err);
      return;
    }

    const passHash = md5[0].pass;
    const sql = `SELECT password, id FROM users WHERE login="${login}"`;
    this.connection.query(sql, (err, data) => {
      if (err) {
        cb(err);
        return;
      }

      if (passHash !== data[0].password) {
        cb();
        return;
      }

      const userId = data[0].id;
      const sessionSalt = (new Date()) + userId;
      const sql = `SELECT MD5("${sessionSalt}") AS sid`;

      this.connection.query(sql, (err, data) => {
        if (err) {
          cb(err);
          return;
        }

        const sessionId = data[0].sid;
        let sql = 'INSERT INTO sessions (user_id, session_id) VALUES ';
        sql += `(${userId},"${sessionId}")`;

        this.connection.query(sql, err => {
          if (err) {
            cb(err);
            return;
          }

          cb(null, sessionId);
        });
      });
    });
  });
};


dbApi.clearSession = function(sessionId, cb) {
  const sql = 'DELETE FROM sessions WHERE session_id="' + sessionId + '"';
  this.connection.query(sql, err => {
    if (err) {
      cb(err);
      return;
    }

    cb();
  });
};



dbApi.checkSession = function(sessionId, cb) {
  const sql = `SELECT user_id FROM sessions WHERE session_id="${sessionId}"`;
  this.connection.query(sql, (err, result) => {
    if (err) {
      cb(err);
      return;
    }

    if (result.length === 0) {
      cb();
      return;
    }

    cb(null, result[0].user_id);
  });
};



dbApi.getTeachers = function(distinct, cb) {
  const ids = new Array();
  const first = distinct.shift();

  let sql = `SELECT * from teachers WHERE name="${first}" OR name="`;
  sql += distinct.join('" OR name="') + '"';
  this.connection.query(sql, (err, teachers) => {
    if (err) {
      cb(err);
      return;
    }
    distinct.unshift(first);
    const newTeachers = distinct.filter(teacher => {
      for (const i in teachers) {
        if (teachers[i].name === teacher) return false;
      }
      return true;
    });

    if (newTeachers.length > 0) this.insertNewTeachers(
      newTeachers, (err) => {
        if (err) {
          cb(err);
          return;
        }

        this.getTeachers(distinct, cb);
      }
    );
    else {
      teachers.forEach(teacher => ids.push(teacher.id));
      cb(null, ids);
    }
  });
};



dbApi.insertNewTeachers = function(values, cb) {
  const sql =
    'INSERT INTO teachers VALUES (null, "' + values.join('"), (null, "') + '")';

  this.connection.query(sql, (err) => {
    if (err) cb(err);
    else cb();
  });
};



dbApi.insertSchedule = function(className, values, cb) {
  this.insertClass(className, (err, classId) => {
    let sql = 'INSERT INTO schedule VALUES ';
    values.forEach(item => {
      sql += `(null, ${item[0]}, ${item[1]}, ${classId}` +
             `, '${item[2]}', ${item[3]}, ${item[4]}),`;
    });
    sql = sql.slice(0, sql.lastIndexOf(','));
    this.connection.query(sql, (err) => {
      if (err) cb(err);
      else cb();
    });
  });
};



dbApi.insertClass = function(className, cb) {
  const sql = 'SELECT * FROM classes WHERE name="' + className + '"';
  this.connection.query(sql, (err, result) => {
    if (err) {
      cb(err);
      return;
    }

    if (result[0]) {
      cb();
      return;
    }

    const sql = 'INSERT INTO classes VALUES (null, \'' + className + '\')';
    this.connection.query(sql, (err, result) => {
      if (err) {
        cb(err);
        return;
      }

      cb(null, result.insertId);
    });
  });
};


dbApi.insertTimetable = function(data, cb) {
  dbApi.clearTimetable((err) => {
    if (err) {
      cb(err);
      return;
    }

    const values = data.map(arr => `(${arr[0]}, '${arr[1]}', '${arr[2]}')`);
    const sql = 'INSERT INTO timetable VALUES ' + values.toString();
    this.connection.query(sql, (err) => {
      if (err) cb(err);
      else cb();
    });
  });
};



dbApi.clearTimetable = function(cb) {
  const sql = 'DELETE FROM timetable WHERE id>0';
  this.connection.query(sql, (err) => {
    if (err) cb(err);
    else cb();
  });
};



dbApi.insertStudents = function(className, data, cb) {
  this.insertClass(className, (err, classId) => {
    if (err) {
      cb(err);
      return;
    }

    const values = data.map(item => `(null, '${item[0]}', ${classId})`);
    const sql = 'INSERT INTO students VALUES ' + values.toString();
    this.connection.query(sql, (err) => {
      if (err) {
        cb(err);
        return;
      }

      this.insertUsers(data, (err, loginInfo) => {
        if (err) {
          cb(err);
          return;
        }

        cb(null, loginInfo);
      });
    });
  });
};


dbApi.insertUsers = function(users, cb) {
  const first = users.shift();
  let sql = 'SELECT id FROM students WHERE name="' + first + '" OR ';
  const values = users.map(item => `name="${item[0]}"`);
  sql += values.join(' OR ');
  this.connection.query(sql, (err, idArr) => {
    const ids = new Array();
    idArr.forEach(item => ids.push(item.id));
    const insert = new Array();
    const loginInfo = new Array();
    users.forEach((user, i) => {
      const md5 = `SELECT MD5("student${ids[i]}")`;
      insert.push(`(null, '${user}', (${md5}), 'students', ${ids[i]})`);
      loginInfo.push({ login: user, password: `student${ids[i]}` });
    });
    const sql = 'INSERT INTO users VALUES ' + insert.toString();
    this.connection.query(sql, (err) => {
      if (err) {
        cb(err);
        return;
      }

      cb(null, loginInfo);
    });
  });
};


module.exports = dbApi;
