'use strict';

const csv = require('csv');
const dbApi = require('./dbApi.js');

const parseFiltered = (filtered, callback) => {
  const teachers = filtered.map(arr => arr[4]);
  const distinctTeachers = new Array();
  const ids = new Map();

  teachers.forEach(teacher => {
    if (distinctTeachers.indexOf(teacher) === -1) {
      distinctTeachers.push(teacher);
    }
  });

  dbApi.getTeachers(distinctTeachers, (err, teachersIds) => {
    if (err) {
      callback(err);
      return;
    }

    distinctTeachers.forEach(
      (teacher, i) => ids.set(teacher, teachersIds[i])
    );

    const parsed = filtered.map(arr => {
      arr[4] = ids.get(arr[4]);
      return arr;
    });

    callback(null, parsed);
  });
};


const insertSchedule = (className, data) => {
  csv.parse(data, (err, data) => {
    const filtered = data.filter(row => {
      let ok = true;
      row.forEach(col => {
        if (!col) ok = false;
      });
      return ok;
    });

    filtered.shift();
    parseFiltered(filtered, (err, parsed) => {
      if (err) {
        global.log.error(err);
      }

      dbApi.insertSchedule(className, parsed, (err) => {
        if (err) global.log.error(err);
      });
    });
  });
};


const insertTimetable = (data) => {
  csv.parse(data, (err, data) => {
    data.shift();
    dbApi.insertTimetable(data, (err) => {
      if (err) global.log.error(err);
    });
  });
};


module.exports = {
  insertSchedule,
  insertTimetable
};
