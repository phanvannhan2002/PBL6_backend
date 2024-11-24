'use strict';

const { StatusCodes, ReasonPhrases } = require("../utils/httpStatusCode");

class SuccessResponse {
    constructor(message, metadata = {}, statusCode = StatusCodes.OK, reasonStatusCode = ReasonPhrases.OK) {
        this.message = message ? message : reasonStatusCode;
        this.metadata = metadata;
        this.status = statusCode;
    }

    send(res, header = {}) {
        return res.status(this.status).json(this);
    }
}

class OK extends SuccessResponse {
    constructor(message, metadata = {}) {
        super(message, metadata);
    }
}

class CREATED extends SuccessResponse {
    constructor(message, metadata = {}, statusCode = StatusCodes.CREATED, reasonStatusCode = ReasonPhrases.CREATED) {
        super(message, metadata, statusCode, reasonStatusCode);
    }
}

module.exports = {
    OK,
    CREATED
}