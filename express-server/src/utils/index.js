'user strict';
const _ = require('lodash');

const getInforData = (data, pick) => {
    return _.pick(data, pick);
}

const replacePlaceHolder = (template, params) => {
    Object.keys(params).forEach(k => {
        let placeHolder = `{{${k}}}`;
        template = template.replace(new RegExp(placeHolder, 'g'), params[k]);
    })
    return template;
}

module.exports = {
    getInforData,
    replacePlaceHolder
}