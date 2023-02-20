import { DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';

export const Client = sequelize.define('client', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  ruc: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  }
}, {
  timestamps: true
});