const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});
router.get('/error', (req, res, next) => {
  res.send('error');
});

router.get('/success', (req, res, next) => {
  res.send('success');
});
module.exports = router;
