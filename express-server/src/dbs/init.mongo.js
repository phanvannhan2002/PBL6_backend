'use strict';
const mongoose = require('mongoose');
const { db} = require('../config/config.mongodb');

class Database {
    

    constructor() {
        this.connect();
    }

    async connect() {
        const logging = process.env.NODE_ENV === 'dev' ? console.log : false;
        const uri = process.env.DEV_DB_URI;
    
        try {
            await mongoose.connect(uri,{
                dbName: process.env.DEV_DB_NAME
            });
            console.log('Connected to MongoDB');
        } catch (err) {
            console.error('Error connecting to MongoDB', err);
        }
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new Database();
        }
        return this.instance;
    }
}

module.exports = Database;