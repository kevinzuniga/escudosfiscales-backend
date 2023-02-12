import { DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';

export const Quote = sequelize.define('quote', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
    },
    client_id: {
        type: DataTypes.INTEGER,
    },
    quote_number: {
        type: DataTypes.INTEGER,
    },
    sell_value: {
        type: DataTypes.FLOAT,
    },
    igv_value: {
        type: DataTypes.FLOAT,
    },
    sell_price: {
        type: DataTypes.FLOAT,
    },
    discount_value: {
        type: DataTypes.FLOAT,
    },
    final_price: {
        type: DataTypes.FLOAT,
    }
}, {
    timestamps: false
});