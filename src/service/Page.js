const { validate } = require('jsonschema');
const PageSchema = require('../models/pageModel');
const throwError = require('../utils/handleErrors');
const dataSchema = require('../validation/pageSchema.json');

class Page {
    constructor(data) {
        this.data = data;
        this.errors = [];
    }

    validatePage() {
        const cleanData = validate(this.data, dataSchema);
        if (!cleanData.valid) {
            const err = cleanData.errors.map((err) => err.stack);
            this.errors = err;
            return err;
        }
        return cleanData.instance;
    }

    async pageExist() {
        const findPage = await PageSchema.findOne({ title: this.data.title });
        if (findPage) {
            this.errors.push('There is a page title conflict');
            return true;
        }
        return false;
    }

    async createPage() {
        return new Promise(async (resolve, reject) => {
            await this.validatePage();
            await this.pageExist();
            if (this.errors.length) {
                return reject(this.errors)
            }
            const page = new PageSchema(this.data);
            try {
                const newPage = await page.save();
                return resolve(newPage);
            } catch (e) {
                this.errors.push("Unable to create new page");
                return reject(this.errors);
            }
        })
    }

    async pageDetails(pageId) {
        const pages = await PageSchema.findById(pageId);
        return pages;
    }

    async updatePageDetails(key, pageUpdate) {
        const pageUpdates = Object.keys(key);
        const allowedUpdates = [
            'pageAddress',
            'pageName',
            'description',
            'location'
        ];
        const isValidUpdate = pageUpdates.every((update) => {
            return allowedUpdates.includes(update);
        });
        if (!isValidUpdate) {
            throwError('Invalid Detail.')
        }

        const updatePageProfile = key;

        pageUpdates.map((update) => {
            pageUpdate[update] = updatePageProfile[update];
        });

        const updatedPage = await pageUpdate.save();
        return updatedPage;
    }

    async deactivatePage(pageId) {
        const pages = await PageSchema.findOneAndUpdate({ _id: pageId },
            {
                $set: { isActive: false },
            }, {
            new: true,
        }
        )
        return pages;
    }
}

module.exports = Page;