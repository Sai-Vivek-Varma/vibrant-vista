
import Post from "../models/Post.js";
import Like from "../models/Like.js";

// Get all likes for a post
export const getPostLikes = async (req, res) => {
  try {
    const postId = req.params.postId;
    const likes = await Like.find({ post: postId }).populate("user", "name email");
    
    res.status(200).json({
      success: true,
      count: likes.length,
      data: likes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Toggle like for a post
export const toggleLike = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if already liked
    const existingLike = await Like.findOne({
      post: postId,
      user: userId,
    });

    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      
      // Update post likes count
      post.likesCount = Math.max(0, (post.likesCount || 1) - 1);
      await post.save();
      
      return res.status(200).json({
        success: true,
        message: "Post unliked successfully",
        liked: false,
        likesCount: post.likesCount
      });
    } else {
      // Like
      const newLike = new Like({
        post: postId,
        user: userId,
      });
      
      await newLike.save();
      
      // Update post likes count
      post.likesCount = (post.likesCount || 0) + 1;
      await post.save();
      
      return res.status(201).json({
        success: true,
        message: "Post liked successfully",
        liked: true,
        likesCount: post.likesCount
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Check if user has liked a post
export const checkLikeStatus = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user?._id;

    let hasLiked = false;
    
    if (userId) {
      const like = await Like.findOne({
        post: postId,
        user: userId,
      });
      hasLiked = !!like;
    }
    
    // Get total likes count
    const likesCount = await Like.countDocuments({ post: postId });

    res.status(200).json({
      success: true,
      hasLiked,
      likesCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get users who liked a post
export const getLikeUsers = async (req, res) => {
  try {
    const postId = req.params.postId;
    
    const likes = await Like.find({ post: postId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
      
    const users = likes.map(like => like.user);
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// Get posts liked by a user
export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
    const likes = await Like.find({ user: userId })
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });
      
    const posts = likes.map(like => like.post).filter(post => post !== null);
    
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};
