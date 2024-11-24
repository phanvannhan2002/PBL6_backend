'use strict'

const { UnProcessableEntityError } = require('../core/error.response');
const TemplateRepository = require('../repositories/template.repo');

class TemplateService  {
    static async newTemplate({tem_name, tem_html}) {
        const holder = await TemplateRepository.getTemplate({tem_name});
        if(holder) {
            throw UnProcessableEntityError("Template is exist");
        }
        return await TemplateRepository.newTemplate({tem_name, tem_html});
    }

    static async getTemplate({tem_name}) {
        return await TemplateRepository.getTemplate({tem_name});
    }
}

module.exports = TemplateService;