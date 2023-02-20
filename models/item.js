import { DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';

export const Item = sequelize.define('item', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  quote_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  comments: {
    type: DataTypes.ARRAY(DataTypes.STRING(300)),
    defaultValue: [],
  },
  in_row_comments: {
    type: DataTypes.STRING(5000),
    defaultValue: [],
  }
}, {
  timestamps: true
});