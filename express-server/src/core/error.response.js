'use strict';
const { prototype } = require('../dbs/init.mongo');
const {ReasonPhrases, StatusCodes} = require('../utils/httpStatusCode');

class ErrorResponse extends Error {
    constructor(message, status) {
        super(message);
        this.statusCode = status;
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = ReasonPhrases.BAD_REQUEST, statusCodes = StatusCodes.BAD_REQUEST) {
        super(message, statusCodes);
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor(message = ReasonPhrases.CONFLICT, statusCodes = StatusCodes.CONFLICT) {
        super(message, statusCodes);
    }
}

class NotFoundRequestError extends ErrorResponse {
    constructor(message = ReasonPhrases.NOT_FOUND, statusCodes = StatusCodes.NOT_FOUND) {
        super(message, statusCodes);
    }
}

class AuthFailureError extends ErrorResponse {
    constructor(message = ReasonPhrases.UNAUTHORIZED, statusCodes = StatusCodes.UNAUTHORIZED) {
        super(message, statusCodes);
    }
}

class ForbiddenRequestError extends ErrorResponse {
    constructor(message = ReasonPhrases.FORBIDDEN, statusCodes = StatusCodes.FORBIDDEN) {
        super(message, statusCodes);
    }
}

class RedisError extends ErrorResponse {
    constructor(message = ReasonPhrases.INTERNAL_SERVER_ERROR, statusCodes = StatusCodes.INTERNAL_SERVER_ERROR) {
        super(message, statusCodes);
    }
}

class UnProcessableEntityError extends ErrorResponse {
    constructor(error = [], statusCodes = StatusCodes.UNPROCESSABLE_ENTITY) {
        super('', statusCodes);
        const errorResponseClass = Object.getPrototypeOf(this);
        const errorClass = Object.getPrototypeOf(errorResponseClass);
        errorClass.error = error;
    }
    
}

module.exports = {
    ErrorResponse,
    BadRequestError,
    ConflictRequestError,
    NotFoundRequestError,
    AuthFailureError,
    ForbiddenRequestError,
    RedisError,
    UnProcessableEntityError
}