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

      this.connection.query('SELECT * FROM timetable', (err, timetable) => {
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

        cb(null, events);
      });
    });
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
  const sql = 'INSERT INTO classes VALUES (null, \'' + className + '\')';
  this.connection.query(sql, (err, result) => {
    if (err) {
      cb(err);
      return;
    }

    cb(null, result.insertId);
  });
};

module.exports = dbApi;
