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
            where: { email: email, password: password },
            attributes: { exclude: ['password'] }
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
        const client = await Client.findOne({
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
export const createQuote = async (event) => {
    const data = JSON.parse(event.body);
    const { items, ...quoteData } = data;
    const sequelize = await initializeSequelize();
    try {
        //creo el quote
        const newQuote = await Quote.create(quoteData);
        //verifico si hay items en el body
        let itemsArray = [];
        if (!!items) {
            //genero la estructura a registrar
            itemsArray = items.map(item => ({
                ...item,
                quote_id: newQuote.id
            }));
            //ingreso cada id de channel en la tabla
            await Item.bulkCreate(itemsArray);
        }
        const client = await Client.findOne({
            where: { id: quoteData.client_id }
        });
        // console.log('CLIENT',client);
        let clientResult = false;
        if (client.dataValues) clientResult = { 
            name: client.dataValues.name,
            ruc: client.dataValues.ruc,
            phone: client.dataValues.phone
        }
        return createResponse(200, { ...newQuote.dataValues, ...clientResult, items: itemsArray });
    } catch (err) {
        return createErrorResponse(err.statusCode, err.message);
    } finally {
        await sequelize.connectionManager.close();
    }
};
export const searchQuote = async (event) => {
    const sequelize = await initializeSequelize();
    const data = JSON.parse(event.body);
    try {
        // realizo el query
        // puede haber query por usuario, por numero de cotizacion
        // por ruc y por rango de fechas
        const { ruc, quote_number, user_id, start_date, end_date } = data;
        const hasRuc = !!ruc | false;
        const hasQN = !!quote_number | false;
        const hasUID = !!user_id | false;
        const hasDate = (!!start_date && !!end_date) | false;
        let query = `
            Select q.*, cli.name, cli.ruc, cli.phone
            from public.quotes as q
            inner join public.users as u on u.id = q.user_id
            inner join public.clients as cli on cli.id = q.client_id
            where 
        `;
        if (hasRuc) query += `cli.ruc = '${ruc}'`;
        if (hasQN) query += query.length ? ` AND q.quote_number = ${quote_number}`: ` q.quote_number = ${quote_number}`;
        if (hasUID) query += query.length ? ` AND u.id = ${user_id}`:` u.id = ${user_id}`;
        if (hasDate) query += query.length ? ` AND q.creation_date > '${start_date}'  AND q.creation_date < '${end_date}'`: ` q.creation_date > '${start_date}'  AND q.creation_date < '${end_date}'`;

        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        // verifico si hay resultados en el query
        if (!(!!results && results.length > 0)) {
            return createErrorResponse(404, 'No quotes found!');
        }
        // entregar el resultado
        return createResponse(200, results);
    } catch (err) {
        return createErrorResponse(err.statusCode, err.message);
    } finally {
        await sequelize.connectionManager.close();
    }
};
export const lastQuotes = async (event) => {
    const sequelize = await initializeSequelize();
    try {
        // realizo el query
        let query = `
            Select q.*, cli.name, cli.ruc, cli.phone
            from public.quotes as q
            inner join public.clients as cli on cli.id = q.client_id
            order by q.creation_date desc
            limit 10
        `;
        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        // verifico si hay resultados en el query
        if (!(!!results && results.length > 0)) {
            return createErrorResponse(404, 'No quotes found!');
        }
        // const client = await Client.findOne({
        //     where: { id: quoteData.client_id }
        // });
        // entregar el resultado
        return createResponse(200, results);
    } catch (err) {
        return createErrorResponse(err.statusCode, err.message);
    } finally {
        await sequelize.connectionManager.close();
    }
};
export const findItems = async (event) => {
    const quote_id = event.pathParameters.quote_id;
    const sequelize = await initializeSequelize();
    try {
        const items = await Item.findAll({
            where: { quote_id: quote_id }
        });
        if (!items) {
            return createErrorResponse(400, 'Items not found!');
        }
        return createResponse(200, items);
    } catch (err) {
        return createErrorResponse(err.statusCode, err.message);
    } finally {
        await sequelize.connectionManager.close();
    }
};
export const allUsers = async (event) => {
    const sequelize = await initializeSequelize({
        attributes: { exclude: ['password'] }
    });
    try {
        const users = await User.findAll();
        if (!users) {
            return createErrorResponse(400, 'Users not found!');
        }
        return createResponse(200, users);
    } catch (err) {
        return createErrorResponse(err.statusCode, err.message);
    } finally {
        await sequelize.connectionManager.close();
    }
};