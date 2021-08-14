const { validate } = require('jsonschema');
const ChannelSchema = require("../models/channelModel");
const dataSchema = require('../validation/channelSchema.json');

class Channel {
    constructor(data) {
        this.data = data;
        this.errors = [];
    }

    validateChannel() {
        const cleanData = validate(this.data, dataSchema);
        if (!cleanData.valid) {
            const err = cleanData.errors.map((err) => err.stack);
            this.errors = err;
            return err;
        }
        return cleanData.instance;
    }

    async channelExist() {
        const findChannel = await ChannelSchema.findOne({ title: this.data.title, location: this.data.location });
        if (findChannel) {
            this.errors.push("This Channel already exists");
            return true;
        }
        return false;
    }

    async channelCreate() {
        return new Promise(async (resolve, reject) => {
            await this.validateChannel()
            await this.channelExist()

            if (this.errors.length) {
                return reject(this.errors);
            }

            const channels = new ChannelSchema(this.data);
            try {
                const newChannel = await channels.save();
                return resolve(newChannel);
            } catch (e) {
                this.errors.push("Unable to create Channel");
                return reject(this.errors);
            }
        })
    }

    async channelDetails(channelId) {
        const channel = await (await ChannelSchema.findById(channelId)).$where(function () { return (this.isActive == true) });
        return channel;
    }

    async updateChannelDetails(key, channelUpdate) {
        const channelUpdates = Object.keys(key);
        const allowedUpdates = [
            'channelAddress',
            'channelName',
            'description',
            'location'
        ];
        const isValidUpdate = channelUpdates.every((update) => {
            return allowedUpdates.includes(update);
        });
        if (!isValidUpdate) {
            throwError('Invalid Detail.')
        }

        const updateChannelProfile = key;

        channelUpdates.map((update) => {
            channelUpdate[update] = updateChannelProfile[update];
        });

        const updatedChannel = await channelUpdate.save();
        return updatedChannel;
    }


    async deactivateChannel(channelId) {
        const removeChannel = await ChannelSchema.findOneAndUpdate({ _id: channelId },
            {
                $set: { isActive: false },
            }, {
            new: true,
        }
        )
        return removeChannel;
    }
}

module.exports = Channel;