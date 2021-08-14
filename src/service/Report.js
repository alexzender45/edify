const { validate } = require('jsonschema');
const reportSchema = require("../models/reportModel");
const dataSchema = require('../validation/reportSchema.json');
const postDataSchema = require('../validation/reportPostSchema.json');

// dataSchema is for users, pages and channels
//postDataSchema is for posts and comments

class Report {
    constructor(data) {
        this.data = data;
        this.errors = [];
    }

    validateReport() {
        const cleanData = validate(this.data, dataSchema);
        if (!cleanData.valid) {
            const err = cleanData.errors.map((err) => err.stack);
            this.errors = err;
            return err;
        }
        return cleanData.instance;
    }

    validatePostReport() {
        const cleanData = validate(this.data, postDataSchema);
        if (!cleanData.valid) {
            const err = cleanData.errors.map((err) => err.stack);
            this.errors = err;
            return err;
        }
        return cleanData.instance;
    }

    async submitReport() {
        return new Promise(async (resolve, reject) => {
            await this.validateReport()

            if (this.errors.length) {
                return reject(this.errors);
            }
            const reports = new reportSchema(this.data);
            try {
                const newReport = await reports.save();
                return resolve(newReport);
            } catch (e) {
                this.errors.push("Unable to send report");
                return reject(this.errors);
            }
        })
    }

    submitPostReport() {
        return new Promise(async (resolve, reject) => {
            await this.validatePostReport()

            if (this.errors.length) {
                return reject(this.errors);
            }
            const reports = new reportSchema(this.data);
            try {
                const newReport = await reports.save();
                return resolve(newReport);
            }
            catch (e) {
                this.errors.push("Unable to send report");
                return reject(this.errors);
            }
        })
    }
}

module.exports = Report;