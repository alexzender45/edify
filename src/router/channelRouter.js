const channelRoute = require("../core/routerConfig");
const channelController = require('../controller/channelController');
const { authenticate, isAllowed, permit, restrict } = require('../core/userAuth');

channelRoute.post('/create-channel', authenticate, permit(['user']), isAllowed([true]), restrict([true]), channelController.createChannel);
channelRoute.get('/channel/:channelId', authenticate, permit(['user']), isAllowed([true]), restrict([true]), channelController.getChannelDetails);
channelRoute.post('/update-channel/:channelId', authenticate, permit(['user']), restrict([true]), channelController.updateChannelProfile);
channelRoute.patch('/channel/:channelId/deactivate', authenticate, permit(['user']), isAllowed([true]), restrict([true]), channelController.deactivateChannel);
module.exports = channelRoute;