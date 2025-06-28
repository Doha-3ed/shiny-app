import NotificationModel from "../../DB/models/notification.model.js";
import { authSocket } from "../../middleWare/authentication.js";
import { asyncHandler } from "../../utilities/globalErrorHandling.js";

export const connectionUser = new Map();

// تسجيل المستخدم وتخزين اتصاله
export const registerAccount = async (socket) => {
  try {
    const data = await authSocket({ socket });
    
    if (![200, 201].includes(data.statusCode)) {
      return socket.emit("authError", data);
    }

    const userId = data.user._id.toString();
    
    // 1. تخزين اتصال المستخدم
    if (!connectionUser.has(userId)) {
      connectionUser.set(userId, new Set());
    }
    connectionUser.get(userId).add(socket.id);

    // 2. إرسال الإشعارات غير المقروءة عند الاتصال
    const unreadNotifications = await NotificationModel.find({
      recipient: userId,
      read: false
    }).sort({ createdAt: -1 });

    if (unreadNotifications.length > 0) {
      socket.emit('initial_notifications', unreadNotifications);
    }

    console.log(`✅ User ${userId} connected with socket ${socket.id}`);
  } catch (error) {
    socket.emit("authError", { 
      statusCode: 500, 
      message: "Internal server error" 
    });
  }
};

// تسجيل خروج المستخدم
export const logOut = (socket) => {
  socket.on("disconnection", async () => {
    try {
      const data = await authSocket({ socket });
      
      if (![200, 201].includes(data.statusCode)) {
        return socket.emit("authError", data);
      }

      const userId = data.user._id.toString();
      
      // 1. إزالة اتصال السوكيت
      if (connectionUser.has(userId)) {
        const userSockets = connectionUser.get(userId);
        userSockets.delete(socket.id);
        
        if (userSockets.size === 0) {
          connectionUser.delete(userId);
        }
      }

      console.log(`❌ User ${userId} disconnected`);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  });
};

// إرسال إشعار إلى مستخدم معين
export const createNotification = async ({
  recipient,
  sender,
  type,
  payload = {}
}) => {
  // التحقق من الحقول المطلوبة
  if (!recipient || !sender || !type) {
    throw new Error('الحقول recipient, sender, type مطلوبة');
  }

  // تحديد محتوى الإشعار حسب النوع
  let message, metadata = {};
  const now = new Date();

  switch (type) {
    case 'order':
      message = `New Order #${payload.orderNo}`;
      metadata = {
        order: payload.orderId,
        totalPrice: payload.totalPrice,
        itemsCount: payload.items?.length || 0,
        address:payload.address,
        phone:payload.phone,
        cartId:payload.cartId,
          totalPrice:payload.totalPrice,
          items: payload.items
      };
      break;

    case 'post':
      message = `New post from ${payload.authorName}`;
      metadata = {
        post: payload.postId,
        postImage: payload.postImage,
        preview: payload.content?.substring(0, 50) || ''
      };
      break;

    case 'comment':
      message = `New comment on ${payload.targetType}`;
      metadata = {
        [payload.targetType]: payload.targetId,
        comment: payload.commentId,
        postImage: payload.postImage,

        preview: payload.text?.substring(0, 30) || ''
      };
      break;

    case 'like':
      message = `إNew like on${payload.targetType}`;
      metadata = {
        [payload.targetType]: payload.targetId,
        postImage: payload.postImage,
 likedBy: sender
      };
      break;

    default:
      message = 'New Notification';
  }

  // إنشاء الإشعار في قاعدة البيانات
  const notification = await NotificationModel.create({
    recipient,
    sender,
    type,
    message,
    ...(type === 'order' && { order: payload.orderId }),
    ...(type === 'post' && { post: payload.postId }),
    metadata,
    read: false
  });

  return notification;
};


export const markAsRead = asyncHandler(async (req, res, next) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  try {
    // 1. Find and validate the notification
    const notification = await NotificationModel.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: "Notification not found or unauthorized"
      });
    }

    // 2. Update if not already read
    if (!notification.read) {
      notification.read = true;
      notification.readAt = new Date();
      await notification.save();

      // 3. Emit real-time update to all client devices
      const io = req.app.get('socketio');
      const recipientSockets = connectionUser.get(userId.toString());
      
      if (recipientSockets && recipientSockets.size > 0) {
        io.to([...recipientSockets]).emit('notification_read', {
          notificationId: notification._id,
          readAt: notification.readAt
        });
      }
    }
console.log("notification for read",notification)
    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    next(error);
  }
});

export const markAllAsRead = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  try {
    // 1. Update all unread notifications
    const result = await NotificationModel.updateMany(
      {
        recipient: userId,
        read: false
      },
      {
        $set: {
          read: true,
          readAt: new Date()
        }
      }
    );

    // 2. Emit bulk read event
    const io = req.app.get('socketio');
    const recipientSockets = connectionUser.get(userId.toString());
    
    if (recipientSockets && recipientSockets.size > 0) {
      io.to([...recipientSockets]).emit('all_notifications_read', {
        count: result.modifiedCount,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    next(error);
  }
});


export const getNotifications = asyncHandler(async (req, res, next) =>{
  const userId = req.user._id;
  const notifications = await NotificationModel.find({recipient:userId}).sort({createdAt:-1});
  if(notifications.length === 0){
    return next(new Error("No notifications found"));
  
  }
  const unreadCount = notifications.filter(n => !n.read).length;

  // 4. الإرجاع
  res.status(200).json({
    success: true,
    message: "Notifications fetched successfully",
    notifications,
    unreadCount
  });
  
})
