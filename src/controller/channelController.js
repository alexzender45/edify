const Channel = require("../service/Channel");
const { error, success } = require('../utils/baseController');
const { logger } = require("../utils/logger");

exports.createChannel = async (req, res) => {
    const userId = req.user._id;
    const { channelAddress, channelName, description, location } = req.body;
    const data = { channelAddress, channelName, description, location, userId };
    try {
        const newChannel = await new Channel(data).channelCreate();
        return success(res, { newChannel });
    } catch (err) {
        logger.error("Error occurred at channel creation", err);
        return error(res, { code: err.code, message: err })
    }
}

exports.getChannelDetails = async (req, res) => {
    const channelId = req.params._id;
    try {
        const channelProfile = await new Channel(req.body).channelDetails(channelId);
        return success(res, { channelProfile })
    } catch (err) {
        logger.error("Could not retrieve Channel Details", err);
        return error(res, { code: err.code, message: err })
    }
}

exports.updateChannelProfile = async (req, res) => {
    try {
        const channelUpdate = req.params;
        const key = req.body;
        const channel = await new Channel(req).updateChannelDetails(key, channelUpdate);
        return success(res, { channel });
    } catch (err) {
        logger.error("Unable to update page", err);
        return error(res, { code: err.code, message: err })
    }
}

exports.deactivateChannel = async (req, res) => {
    const channelId = req.params._id;
    try {
        const deactivateChannel = await new Channel(req.body).deactivateChannel(channelId);
        return success(res, { deactivateChannel });
    } catch (err) {
        logger.error("Could not deactivate Channel, Try again", err);
        return error(res, { code: err.code, message: err })
    }
}