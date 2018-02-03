'use strict';

apiPost('/:fn', (req, res) => {
  const fn = req.params.fn;
  const body = req.body;
  dbApi[fn](body, (err, data) => {
    if (err) {
      res.sendStatus(500);
      global.log(err);
    } else if (!data) {
      res.sendStatus(401);
    } else {
      res.json(data);
    }
  });
});
