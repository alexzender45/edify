const postRoute = require('../core/routerConfig');
const postController = require('../controller/postController');
const { authenticate, permit, restrict } = require('../core/userAuth');
const { upload } = require('../utils/aws');

postRoute.post("/", authenticate, permit(['user']), upload, restrict([true]), postController.createPost);
postRoute.delete("/:postId", authenticate, permit(['user']), restrict([true]), postController.deletePost);
postRoute.get("/:postId", authenticate, permit(['user']), restrict([true]), postController.getPost);
postRoute.get("/source/:sourceId", authenticate, permit(['user']), restrict([true]), postController.getPostBySourceId);
postRoute.put("/:postId", authenticate, permit(['user']), restrict([true]), postController.reactToPost);

module.exports = postRoute;
