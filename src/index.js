require('dotenv').config();
const express = require('express');
const Sequelize = require('sequelize');

main();

async function main() {
  const app = express();

  const db = makeDb();

  const UserModel = makeUserModel(db, Sequelize.DataTypes);

  app.use(express.json());

  app.get('/health', healthCheck);
  app.get('/', healthCheck);

  const userController = makeUserHttpController(UserModel);

  app.post('/users', userController.createUser);
  app.patch('/users/:id', userController.updateUser);
  app.get('/users', userController.listUsers);

  app.listen(8080, () => console.log('Server is running at http://localhost:8080'));
}

function healthCheck(req, res) {
  console.log(req.body);
  res.json({ message: 'ok', ts: new Date() });
}

function makeDb(penv = process.env) {

  const { DB_URL } = penv;

  const url = new URL(DB_URL);
  console.log({ url });

  let sequelize = new Sequelize(
    url.pathname.replace('/', ''),
    url.username, 
    url.password,
    {
      host: url.hostname,
      port: url.port,
      dialect: url.protocol.replace(':', ''),
    },
  );

  return sequelize;
}

function makeUserModel(sequelize, DataTypes) {

  class User extends Sequelize.Model {

  }

  User.init({
    id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      field: 'username',
    },
    full_name: {
      type: DataTypes.STRING,
      field: 'full_name',
    },
    json_data: {
      type: DataTypes.JSON,
      field: 'json_data',
    },
    c_date: {
      type: DataTypes.INTEGER,
      field: 'c_date',
    },
    u_date: {
      type: DataTypes.INTEGER,
      field: 'u_date',
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'tbl_user_test',
    timestamps: false, // NO createdAt, updatedAt

  });

  return User;
}

function makeUserHttpController(UserModel) {

  async function createUser(req, res) {
    const result = { data: null, error: null, ts: new Date() };

    try {
      // TODO: validate anything received from outside
      const { username, full_name, json_data } = req.body;

      const user = await UserModel.create({
        username,
        full_name,
        json_data,
        c_date: Math.round(Date.now() / 1000),
        u_date: Math.round(Date.now() / 1000),
      });

      result.data = user;
    } catch (err) {
      // TODO: avoid leaking internal error messages
      result.error = err.message || 'Unknown error';
    }


    res.json(result);
  }

  async function listUsers(req, res) {
    const result = { data: null, error: null, ts: new Date() };

    try {
      result.data = await UserModel.findAll(); // where('id', 1).limit(10).offset(offset || 0)
    } catch (err) {
      // TODO: avoid leaking internal error messages
      result.error = err.message || 'Unknown error';
    }

    res.json(result);
  }

  async function updateUser(req, res) {
    const result = { data: null, error: null, ts: new Date() };

    try {
      const { id } = req.params; // Express path parameters
      const user = await UserModel.findOne({ where: { id }});

      if (!user) {
        // NOT a generic database error; explicit
        // TODO: separate user errors, data errors, server/code errors
        throw new Error('User not found');
        //result.error = 'User not found';
      }

      // TODO: security check!

      const { username, full_name, json_data } = req.body;

      user.username = username;
      user.full_name = full_name;
      user.json_data = json_data;
      user.u_date = Math.round(Date.now() / 1000);

      result.data = await user.save(); // pass changes to the database

      // OPTION 2: use update method with where clause

    } catch (err) {
      // TODO: avoid leaking internal error messages
      // distinquish server/code errors from data errors
      result.error = err.message || 'Unknown error';
    }

    res.json(result);
  }

  return {
    createUser,
    listUsers,
    updateUser,
  };
}