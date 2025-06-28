
import NotificationModel from "../../DB/models/notification.model.js";
import postModel from "../../DB/models/post.model.js";
import userModel from "../../DB/models/user.model.js";
import Comment from "../../DB/models/comment.model.js"
import cloudinary from "../../utilities/cloudnairy/index.js";
import { asyncHandler } from "../../utilities/globalErrorHandling.js";
import { connectionUser } from "../notification/notification.service.js";

export const createPost = asyncHandler(async (req, res,next) => {
    try {
        
    
        const { content } = req.body;
        const doctorId = req.user._id; 
        let uploadedImages = [];

        
       if (req.files && req.files.attachments) {
  for (let image of req.files.attachments) {
    const uploadedImage = await cloudinary.uploader.upload(image.path, {
      folder: 'posts',
    });
    
            // Store image URL and public ID
            uploadedImages.push({
              url: uploadedImage.secure_url,
              publicId: uploadedImage.public_id,
            });
          }
        }
        // Create a new post
        const post = await postModel.create({
          doctorId,
          content,
          images:uploadedImages,
        });
    
        if (!post) {
          return next(new Error("Post not created")); // If the post could not be created
        }
    
        res.status(201).json({
          success: true,
          message: 'Post created successfully',
          post:{
           _id:post._id,
            content:post.content,
            images:post.images,
           likes:post.likes
          },
        });
      } catch (err) {
       
        return next(new ErrorResponse("Error creating post", 500, err)); // Custom error handling with next
      }
  });
  //--------------------------------------------------------------deletePosts--------------------------------------------------------------------
  export const deletePost = asyncHandler(async (req, res) => {
    try {
       const {id}=req.params;
        const post = await postModel.findOneAndDelete({_id:id,doctorId:req.user._id});
    
        if (!post) {
          return next(new Error("Post not found")); // If the post could not be found
        }
    
        res.status(200).json({
          success: true,
          message: 'Post deleted successfully',
          post,
        });
      } catch (err) {
        console.error('Error deleting post:', err);
    
        // In case of an error, pass it to next
        return next(new ErrorResponse("Error deleting post", 500, err)); // Custom error handling with next
      }
      
  });
  //------------------------------------------------------getAllPosts-------------------------------------------------------------------
  export const getAllPosts = asyncHandler(async (req, res) => {
    try {
      const posts = await postModel.find().select('content images createdAt').sort({ createdAt: -1 });
      const postIds = posts.map(post => post._id);

      const comments = await Comment.find({
          onModel: "Post",
          refId: { $in: postIds },
          parentId: null,
          isDeleted: false
        })
          .select("content createdAt userId refId")
          .populate("userId", "name profileImage")
          .sort({ createdAt: -1 });

        // 4. Get replies (parentId != null)
        const replies = await Comment.find({
          onModel: "comment",
          parentId: { $ne: null },
          isDeleted: false
        })
          .select("content createdAt userId refId parentId")
          .populate("userId", "name profileImage")
          .sort({ createdAt: -1 }); 
      res.status(200).json({
        success: true,
        message: 'Posts fetched successfully',
        posts,
        comments,
        replies
      });
    } catch (err) {
      console.error('Error fetching posts:', err);
    
      // In case of an error, pass it to next
      return next(new Error("Error fetching posts")); // Custom error handling with next
    }
  });
  //------------------------------------------------------getAllPostsforSpecificDoctor-------------------------------------------------------------------
  export const forSpecificDoctor = asyncHandler(async (req, res, next) => {
    try {
      // Ensure user is authenticated and is a doctor
      
  
      const doctorId = req.user._id;
  
      const posts = await postModel
        .find({ doctorId }).select("content images createdAt ")
       
        .sort({ createdAt: -1 }); // Optional: Sort newest first
  if(!posts.length){
    return next(new Error("Posts not found"))
  }

      const postIds = posts.map(post => post._id);

      const comments = await Comment.find({
          onModel: "Post",
          refId: { $in: postIds },
          parentId: null,
          isDeleted: false
        })
          .select("content createdAt userId refId")
          .populate("userId", "name profileImage")
          .sort({ createdAt: -1 });

        // 4. Get replies (parentId != null)
        const replies = await Comment.find({
          onModel: "comment",
          parentId: { $ne: null },
          isDeleted: false
        })
          .select("content createdAt userId refId parentId")
          .populate("userId", "name profileImage")
          .sort({ createdAt: -1 }); 
      res.status(200).json({
        success: true,
        message: "Doctor's posts fetched successfully",
        posts,
        comments,
        replies
      });
    } catch (err) {
      
      return next(new Error("Error fetching posts"));
    }
  });
  //------------------------------------------------------likePost-------------------------------------------------------------------
 

export const likePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user._id;

  
  const post = await postModel.findById(postId)

  

  let action;
  let updatedPost;

  const hasLiked = post.likes.includes(userId);

  if (hasLiked) {
    updatedPost = await postModel.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    );
    action = 'unliked';
  } else {
    updatedPost = await postModel.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: true }
    );
    action = 'liked';

    // ✅ Send notification to doctor if someone liked the post
   if (userId.toString() !== post.doctorId._id.toString()) {
        const io = req.app.get('socketio');
        const liker = await userModel.findById(userId, 'name profileImage');
        
        // Create notification
        const notification = await NotificationModel.create({
          recipient: post.doctorId._id,
          sender: userId,
          type: 'like',
          message: `${liker.name} liked your post `,
          post: postId,
          metadata: {
            postContent: post.content.substring(0, 30),
            PostImage: post.images[0]?.url || null,
            likerName: liker.name,
            likerAvatar: liker.profileImage
          }
        });

        // Send real-time notification
        const recipientSockets = connectionUser.get(post.doctorId._id.toString());
        if (recipientSockets && recipientSockets.size > 0) {
          io.to([...recipientSockets]).emit('new_notification', {
            type: 'like',
            message: notification.message,
            postId: post._id,
            createdAt: new Date(),
            notificationId: notification._id
          });
        }
      }
    }

  res.status(200).json({
    success: true,
    message: `Post ${action}`,
    post: updatedPost,
  });
});



          
    