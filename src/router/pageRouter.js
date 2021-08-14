const pageRoute = require("../core/routerConfig");
const pageController = require('../controller/pageController');
const { authenticate, permit, restrict } = require('../core/userAuth');

pageRoute.post('/create-page', authenticate, permit(['user']), restrict([true]), pageController.createPage);
pageRoute.get('/page/:pageId', authenticate, permit(['user']), restrict([true]), pageController.getPageDetails);
pageRoute.post('/update-page/:pageId', authenticate, permit(['user']), restrict([true]), pageController.updatePageProfile);
pageRoute.patch('/page/:pageId/deactivate', authenticate, permit(['user']), restrict([true]), pageController.deactivatePage);

module.exports = pageRoute;