'use strict';
const {
  Model,
  Sequelize,
  DataTypes
} = require('sequelize');
const sequelize = require('../../config/db');
const bcrypt = require('bcrypt');


module.exports = sequelize.define('user', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  userType: {
    type: DataTypes.ENUM('0', '1', '2'),
  },
  name: {
    type: DataTypes.STRING
  },
  username: {
    type: DataTypes.STRING
  },
  password: {
    type: DataTypes.STRING
  },
  confirmPassword: {
    type: DataTypes.VIRTUAL,
    set(value) {
      if (value === this.password) {
        const hashPassword = bcrypt.hashSync(value, 10);
        this.setDataValue('password', hashPassword)
      } else {
        throw new Error('Passwords do not match')
      }
    }
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  deletedAt: {
    type: DataTypes.DATE
  },
},
  {
    freezeTableName: true,
    modelName: 'user',
    paranoid: true,
    schema: 'cars',
  });