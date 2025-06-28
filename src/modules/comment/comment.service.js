
import { asyncHandler } from "../../utilities/globalErrorHandling.js";
import Comment from "../../DB/models/comment.model.js";
import Post from "../../DB/models/post.model.js";
import NotificationModel from "../../DB/models/notification.model.js";
import userModel from "../../DB/models/user.model.js";
import { connectionUser } from "../notification/notification.service.js";

 // or wherever you manage connected users

export const createComment = async (req, res) => {
  try {
    const { content, refId, onModel, parentId, attachments } = req.body;
    const userId = req.user._id;
console.log("userId : ", userId)
    const comment = await Comment.create({
      content,
      refId,
      onModel,
      parentId: parentId || null,
      attachments,
      userId
    });
console.log("comment : ", comment )
    // Notify doctor if comment is on a post
    if (onModel === "Post") {
      const post = await Post.findOne({_id:refId}).populate({
        path: "doctorId"
      });
      if (!post) return res.status(404).json({ message: "Post not found" });
console.log("post : ", post)
      const doctorUserId = post.doctorId?._id?.toString();
console.log("doctorUserId : ", doctorUserId)
      if (doctorUserId && doctorUserId !== userId.toString()) {
        const commenter = await userModel.findById(userId, "name profileImage");
        console.log("commenter : ", commenter)
        const io = req.app.get("socketio");


        // 4. Create rich notification
        const notification = await NotificationModel.create({
          recipient: doctorUserId,
          sender: userId,
          type: "comment",
          message: `${commenter.name} commented on your post`,
          post: refId,
          metadata: {
            commentId: comment._id,
            postPreview: post.content.substring(0, 30),
            postImage: post.images,
            commentPreview: content.substring(0, 50),
            commenterAvatar: commenter.profileImage
          }
        });
console.log("notification : ", notification)
        // 5. Send real-time notification to all recipient's devices
        const recipientSockets = connectionUser.get(doctorUserId);

        console.log("Recipient sockets: ", connectionUser.get(doctorUserId));
        if (recipientSockets && recipientSockets.size > 0) {
          io.to([...recipientSockets]).emit("new_notification", {
            type: "comment",
            id: notification._id,
            message: notification.message,
            postId: refId,
            commentId: comment._id,
            createdAt: new Date(),
            isRead: false,
            sender: {
              id: userId,
              username: commenter.name,
              avatar: commenter.profileImage
            }
          });
        }
      }

      // 6. Also notify parent comment author if this is a reply
      if (parentId ) {
        const parentComment = await Comment.findById(parentId).populate("userId");
        if (parentComment && parentComment.userId._id.toString() !== userId.toString()) {
          await NotificationModel.create({
            recipient: parentComment.userId._id,
            sender: userId,
            type: "comment",
            message: `${req.user.name} replied to your comment`,
            post: refId,
            metadata: {
              parentCommentId: parentId,
              replyContent: content.substring(0, 50),
            }
          });
        }
      }
    }
 const populatedComment = await Comment.findById(comment._id).populate({
      path: "userId",
      select: "name profileImage"
    });
    res.status(201).json({ message: "Comment created", comment: populatedComment });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

  //------------------------------------------like comments----------------------------------------------------------------------------------------
  export const likeComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  // Check if the comment is already liked by the user
  const existingLike = await Comment.findOne({
    _id: commentId,
    isDeleted: false,
    likes: { $in: [req.user._id] }
  });

  let updatedComment;

  if (existingLike) {
    // Unlike the comment
    updatedComment = await Comment.findOneAndUpdate(
      { _id: commentId, isDeleted: false },
      { $pull: { likes: req.user._id } },
      { new: true }
    );
  } else {
    // Like the comment
    updatedComment = await Comment.findOneAndUpdate(
      { _id: commentId, isDeleted: false },
      { $addToSet: { likes: req.user._id } },
      { new: true }
    );

    if (updatedComment) {
      // Notify the comment owner if it's not the liker themselves
     if (updatedComment.userId._id.toString() !== userId.toString()) {
        const liker = await userModel.findById(userId, 'name profileImage');
        const io = req.app.get('socketio');

        // 6. Create rich notification
        const notification = await NotificationModel.create({
          recipient: updatedComment.userId._id,
          sender: userId,
          type: 'like',
          message: `${liker.name} liked your comment`,
          comment: commentId,
          metadata: {
            commentPreview: updatedComment.content.substring(0, 50),
            likerName: liker.name,
            likerAvatar: liker.profileImage,
            postId: updatedComment.refId // Assuming comments reference posts
          }
        });

        // 7. Send real-time notification
        const recipientSockets = connectionUser.get(updatedComment.userId._id.toString());
        if (recipientSockets && recipientSockets.size > 0) {
          io.to([...recipientSockets]).emit('new_notification', {
            type: 'like',
            id: notification._id,
            message: notification.message,
            commentId,
            postId: updatedComment.refId,
            createdAt: new Date(),
            sender: {
              id: userId,
              name: liker.name,
              avatar: liker.profileImage
            }
          });
        }
      }
    }
  }

  res.status(201).json({ msg: "done", updatedComment });
});
export const getComments = asyncHandler(async (req, res, next) => {
  const comments = await commentModel.find({ postId: req.params.postId })
    .populate({
      path: "userId",
      select: "name profileImage", // هات الاسم والصورة بس
    });

  res.status(200).json({ msg: "done", comments });
});

