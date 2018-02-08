(client, callback) => {
  api.getSchedule({ classId: 1 }, (data) => {
    callback(data);
  });
};
