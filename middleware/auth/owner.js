// check owner of route by compare id provide in path and decoded jwt user id
// after isAuth
const checkOwner = async (req, res, next) => {
  const userIdParam = parseInt(req.params.id, 10);
  const userIdJWT = req.decodedJWT.userId;
  if (userIdJWT === userIdParam) {
    next();
  }
  const error = new Error('can not access other user function');
  error.statusCode = 403;
  next(error);
};

module.exports = checkOwner;
