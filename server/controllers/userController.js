
import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Like from "../models/Like.js";
import jwt from "jsonwebtoken";

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.send(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user profile" });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "bio", "avatar"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    
    if (!isValidOperation) {
      return res.status(400).json({ error: "Invalid updates" });
    }
    
    // Only allow users to update their own profile
    if (req.params.id && req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to update this profile" });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    
    res.send(user);
  } catch (error) {
    res.status(400).json({ error: "Error updating user profile" });
  }
};

// Get posts by a specific user
export const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const posts = await Post.find({ author: userId })
      .populate("author", "name email bio")
      .sort({ createdAt: -1 });
      
    // Add comment and like counts
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const commentsCount = await Comment.countDocuments({ post: post._id });
        const likesCount = await Like.countDocuments({ post: post._id });
        
        const postObj = post.toObject();
        return {
          ...postObj,
          commentsCount,
          likesCount
        };
      })
    );
    
    res.send(postsWithCounts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user posts" });
  }
};

// Get user dashboard statistics
export const getUserStats = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    
    // Only allow users to see their own stats
    if (req.params.id && req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to view these stats" });
    }
    
    // Get post count
    const postCount = await Post.countDocuments({ author: userId });
    
    // Get view count
    const posts = await Post.find({ author: userId });
    const viewCount = posts.reduce((total, post) => total + (post.views || 0), 0);
    
    // Get comment count on user's posts
    const commentCount = await Comment.countDocuments({ 
      post: { $in: posts.map(post => post._id) } 
    });
    
    // Get like count on user's posts
    const likeCount = await Like.countDocuments({
      post: { $in: posts.map(post => post._id) }
    });
    
    // Get follower count (for future feature)
    // const followerCount = await Follow.countDocuments({ following: userId });
    const followerCount = 0;
    
    // Get following count (for future feature)
    // const followingCount = await Follow.countDocuments({ follower: userId });
    const followingCount = 0;
    
    res.json({
      postCount,
      viewCount,
      commentCount,
      likeCount,
      followerCount,
      followingCount
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching user stats" });
  }
};

// Get top users (most posts, most likes, etc)
export const getTopUsers = async (req, res) => {
  try {
    // Get users with most posts
    const topPosters = await Post.aggregate([
      { $group: { _id: "$author", postCount: { $sum: 1 } } },
      { $sort: { postCount: -1 } },
      { $limit: 5 },
      { 
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: "$userDetails._id",
          name: "$userDetails.name",
          email: "$userDetails.email",
          postCount: 1
        }
      }
    ]);
    
    res.json(topPosters);
  } catch (error) {
    res.status(500).json({ error: "Error fetching top users" });
  }
};

// Get suggested users to follow (for future feature)
export const getSuggestedUsers = async (req, res) => {
  try {
    // For now, just return some random users excluding the current user
    const suggestedUsers = await User.find({ 
      _id: { $ne: req.user._id } 
    })
    .select("name email bio")
    .limit(5);
    
    res.json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching suggested users" });
  }
};
