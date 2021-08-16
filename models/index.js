/* eslint-disable */
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  const link = process.env[config.use_env_variable]+ '?sslmode=require'
  console.log('link : ', link)
  sequelize = new Sequelize(link, config);
  console.log('sequelize alckfjir:\n', sequelize)
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
    { timezone: '+07:00' },
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
// console.log('sequelize unzip1', sequelize)
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.basename = basename;
db.connect = async () => {
  try {
    await db.sequelize.authenticate();
    // {force: false}
    await db.sequelize.sync({force: false});
    console.log('Connection has been established successfully .');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
console.log('db\n',db.sequelize.models)
module.exports = db;
