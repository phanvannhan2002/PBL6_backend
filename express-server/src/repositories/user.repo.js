'use strict';

const User = require('../models/user.model');

class UserRepository {
    static async createUser({username, email, password}) {
        return await User.create({
            username,
            email,
            password
        });
    }

    static async getUserById(id, unSelect = []) {
        return await User.findById(id).lean();
    }

    static async searchUser(searchQuery, unSelect = []) {
        return await User.find(searchQuery).lean();
    }

    static async findUserByUsername(username, unSelect = []) {
        return await this.searchUser({username}, unSelect);
    }

    static async findUserByEmail(email, unSelect = []) {
        return await this.searchUser({email}, unSelect);
    }

    static async updateUser(userId, newData) {
        return await User.findByIdAndUpdate(userId, newData);
    }
}

module.exports = UserRepository;