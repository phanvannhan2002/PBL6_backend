'use strict';
require('dotenv').config();

const dev = {
    app: {
        port: process.env.DEV_APP_PORT || 3000
    },
    db: {
        host: process.env.DEV_DB_HOST || 'localhost',
        username: process.env.DEV_DB_USERNAME || 'postgres',
        port: process.env.DEV_DB_PORT || '5432',
        name: process.env.DEV_DB_NAME || 'dev',
        password: process.env.DEV_DB_PASSWORD
    }
}

const pro = {
    app: {
        port: process.env.PRO_APP_PORT || 3000
    },
    db: {
        host: process.env.PRO_DB_HOST || 'localhost',
        port: process.env.PRO_DB_PORT || '27017',
        name: process.env.PRO_DB_NAME || 'dev'
    }
}

const config = {pro, dev};
const env = process.env.NODE_ENV || 'dev';
module.exports = config[env];