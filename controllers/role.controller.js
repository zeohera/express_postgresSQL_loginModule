const service = require('../services/role.service');

module.exports.getAllRole = async (req, res, next) => {
  try {
    const data = await service.getAllRole();
    if (data) res.status(200).json(data);
    else res.json(400).json({ message: 'role not found' });
  } catch (error) {
    next(error);
  }
};
