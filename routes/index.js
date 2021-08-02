var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/error',function(req, res, next) {
  res.send('errror');
})

router.get('/success',function(req, res, next) {
  res.send('success');
})
module.exports = router;
