(client, callback) => {
  api.getEvents({ classId: 1 }, (data) => {
    callback(data);
  });
};
