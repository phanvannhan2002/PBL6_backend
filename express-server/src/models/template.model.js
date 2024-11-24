const {Schema, model, unique} = require('mongoose');

const templateSchema = new Schema({
    tem_name: {
        type: String,
        require: true,
        unique
    },
    tem_status: {
        type: String,
        default: 'active'
    },
    tem_html: {
        type: String
    }
});

const Template = model('Template', templateSchema);

module.exports = Template;