"use strict";
import { loadSequelize } from './database/database.js';
import { Op, QueryTypes } from 'sequelize';
import { User } from './models/user.js';
import { Client } from './models/client.js';
import { Quote } from './models/quote.js';
import { Item } from './models/item.js';
let sequelizeInstance = null;

const initializeSequelize = async () => {
    if (!sequelizeInstance) {
        sequelizeInstance = await loadSequelize();
    } else {
        // restart connection pool to ensure connections are not re-used across invocations
        sequelizeInstance.connectionManager.initPools();

        // restore `getConnection()` if it has been overwritten by `close()`
        if (sequelizeInstance.connectionManager.hasOwnProperty("getConnection")) {
            delete sequelizeInstance.connectionManager.getConnection;
        }
    }
    return sequelizeInstance;
}

const createResponse = (statusCode, body) => ({
    statusCode: statusCode || 200,
    headers: {
        "Access-Control-Allow-Origin": "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(body) || 'ok',
});
const createErrorResponse = (statusCode, message) => ({
    statusCode: statusCode || 501,
    headers: {
        "Access-Control-Allow-Origin": "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify({ message }) || JSON.stringify({ message: 'Unknown error.' }),
});

export const hello = async (event, context, callback) => {
    const sequelize = await initializeSequelize();
    try {
        // return await doSomethingWithSequelize(sequelize);
        return {
            statusCode: 200,
            body: JSON.stringify(
                {
                    message: "Go Serverless v3.0! Your function executed successfully!",
                    comment: "prueba",
                    input: event,
                }
            ),
        };
    } finally {
        // close any opened connections during the invocation
        // this will wait for any in-progress queries to finish before closing the connections
        // console.log('sequelize',sequelize);
        await sequelize.connectionManager.close();
    }
};
export const createUser = async (event) => {
    const data = JSON.parse(event.body);
    const sequelize = await initializeSequelize();
    try {
        //creo el user
        const newUser = await User.create(data);
        return createResponse(200, newUser);
    } catch (err) {
        return createErrorResponse(err.statusCode, err.message);
    } finally {
        await sequelize.connectionManager.close();
    }
};
export const login = async (event) => {
    const { email, password } = JSON.parse(event.body);
    const sequelize = await initializeSequelize();
    try {
        const user = await User.findOne({
            where: { email: email, password: password }
        });
        if (!user) {
            return createErrorResponse(400, 'User not found!');
        }
        return createResponse(200, user);
    } catch (err) {
        return createErrorResponse(err.statusCode, err.message);
    } finally {
        await sequelize.connectionManager.close();
    }
};
export const createClient = async (event) => {
    const data = JSON.parse(event.body);
    const sequelize = await initializeSequelize();
    try {
        //creo el client
        const newClient = await Client.create(data);
        return createResponse(200, newClient);
    } catch (err) {
        return createErrorResponse(err.statusCode, err.message);
    } finally {
        await sequelize.connectionManager.close();
    }
};
export const findClient = async (event) => {
    const ruc = event.pathParameters.ruc;
    const sequelize = await initializeSequelize();
    try {
        const client = await User.findOne({
            where: { ruc: ruc }
        });
        if (!client) {
            return createErrorResponse(400, 'Client not found!');
        }
        return createResponse(200, client);
    } catch (err) {
        return createErrorResponse(err.statusCode, err.message);
    } finally {
        await sequelize.connectionManager.close();
    }
};