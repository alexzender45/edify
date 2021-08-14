const commentRoute = require('../core/routerConfig');
const commentController = require('../controller/commentController');
const { authenticate, permit, restrict } = require('../core/userAuth');
const { upload } = require('../utils/aws');

commentRoute.post("/", authenticate, permit(['user']), upload, restrict([true]), commentController.createComment);
commentRoute.delete("/:commentId", authenticate, permit(['user']), restrict([true]), commentController.deleteComment);
commentRoute.get("/:_id", authenticate, permit(['user']), restrict([true]), commentController.getComment);
commentRoute.get("/post/:postId", authenticate, permit(['user']), restrict([true]), commentController.getCommentByPostId);
commentRoute.get("/user/:userId", authenticate, permit(['user']), restrict([true]), commentController.getCommentByUserId);
commentRoute.patch("/:commentId", authenticate, permit(['user']), restrict([true]), commentController.reactToComment);

module.exports = commentRoute;
