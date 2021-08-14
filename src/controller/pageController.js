const Page = require('../service/Page');
const { error, success } = require('../utils/baseController');
const { logger } = require('../utils/logger');

exports.createPage = async (req, res) => {
    const userId = req.user._id;
    const { pageAddress, pageName, description, location } = req.body;
    const data = { pageAddress, pageName, description, location, userId };
    try {
        const pageDetails = await new Page(data).createPage();
        return success(res, { pageDetails })
    } catch (err) {
        logger.error("Error occured at Page Creation", err);
        return error(res, { code: 400, message: err })
    }
}

exports.getPageDetails = async (req, res) => {
    const pageId = req.params._id;
    try {
        const pageDetails = await new Page(req.body).pageDetails(pageId);
        return success(res, { pageDetails });
    } catch (err) {
        logger.error("Could not retrieve page details", err);
        return error(res, { code: 400, message: err })
    }
}

exports.updatePageProfile = async (req, res) => {
    try {
        const pageUpdate = req.params;
        const key = req.body;
        const page = await new Page(req).updatePageDetails(key, pageUpdate);
        return success(res, { page });
    } catch (err) {
        logger.error("Unable to update page", err);
        return error(res, { code: err.code, message: err.message });
    }
}

exports.deactivatePage = async (req, res) => {
    const pageId = req.params._id;
    try {
        await new Page(req.body).deactivatePage(pageId);
        return success(res, "Page Deactivated Successfully")
    } catch (err) {
        logger.error("Error occurred during Page Deletion", err);
        return error(res, { code: 400, message: err })
    }
}