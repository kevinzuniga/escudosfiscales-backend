import { DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';

import { Quote } from './quote.js';

// const { PollsxChannels } = require('./PollxChannel.js');
// const { Votes } = require('./Vote.js');

export const User = sequelize.define('user', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  full_name: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(200), // VARCHAR(500)
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: false,
  }
}, {
  timestamps: true
});

User.hasMany(Quote, {
  foreignKey: 'user_id',
  sourceKey: 'id'
});

// PollsxChannels.belongsTo(User, {
//   foreignKey: 'poll_id',
//   targetId: 'id'
// });

// User.hasMany(Votes, {
//   foreignKey: 'poll_id',
//   sourceKey: 'id'
// });

// Votes.belongsTo(User, {
//   foreignKey: 'poll_id',
//   targetId: 'id'
// });

// exports.Polls = User;