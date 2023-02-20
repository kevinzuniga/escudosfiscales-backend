import { DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';

export const Quote = sequelize.define('quote', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    client_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    quote_number: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    relation_quote_number: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    sell_value: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    igv_value: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    sell_price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    discount_value: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    final_price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    creation_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
}, {
    timestamps: false,
    hooks: {
        beforeCreate: (quote, options) => {
            return Quote.max('quote_number').then(maxQN => {
                let quote_number = false;
                const year = new Date().getFullYear();
                if (maxQN){
                    //averiguar si es del mismo año
                    const maxQNYear = maxQN.toString().substring(0,4);
                    if (maxQNYear == year) quote_number = maxQN + 1
                    else quote_number = year + '1001'
                } else {
                    //no existe ningun registro
                    quote_number = year + '1001'
                }
                quote.quote_number = quote_number;
            });
        }
    }
});