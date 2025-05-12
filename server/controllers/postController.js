
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Like from "../models/Like.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query based on filters
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (tag) {
      query.tags = tag;
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "name email bio")
      .lean();

    // Add likes count to each post
    const postsWithCounts = await Promise.all(posts.map(async (post) => {
      const likesCount = await Like.countDocuments({ post: post._id });
      const commentsCount = await Comment.countDocuments({ post: post._id });
      return {
        ...post,
        likes: likesCount,
        commentCount: commentsCount
      };
    }));
      
    res.send(postsWithCounts);
  } catch (error) {
    console.error("Error in getPosts:", error);
    res.status(500).send({ error: "Error fetching posts" });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name email bio")
      .populate({
        path: "comments",
        populate: { path: "author", select: "name email" },
      });

    if (!post) return res.status(404).send({ error: "Post not found" });
    
    // Increment view count
    post.views += 1;
    await post.save();
    
    // Get likes count
    const likesCount = await Like.countDocuments({ post: post._id });
    
    // Check if user has liked the post
    let hasLiked = false;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const userId = decoded.id;
          hasLiked = await Like.exists({ post: post._id, user: userId });
        } catch (err) {
          // Token validation error - ignore
        }
      }
    }
    
    res.send({ 
      ...post.toObject(), 
      likes: likesCount,
      hasLiked: !!hasLiked
    });
  } catch (error) {
    console.error("Error in getPost:", error);
    res.status(500).send({ error: "Error fetching post" });
  }
};

export const getFeaturedPosts = async (req, res) => {
  try {
    const featuredPosts = await Post.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 2)
      .populate("author", "name email bio");
      
    // Add counts
    const postsWithCounts = await Promise.all(featuredPosts.map(async (post) => {
      const likesCount = await Like.countDocuments({ post: post._id });
      const commentsCount = await Comment.countDocuments({ post: post._id });
      return {
        ...post.toObject(),
        likes: likesCount,
        commentsCount
      };
    }));
      
    res.json(postsWithCounts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching featured posts" });
  }
};

export const getLatestPosts = async (req, res) => {
  try {
    const latestPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 5)
      .populate("author", "name email bio");
      
    // Add counts
    const postsWithCounts = await Promise.all(latestPosts.map(async (post) => {
      const likesCount = await Like.countDocuments({ post: post._id });
      const commentsCount = await Comment.countDocuments({ post: post._id });
      return {
        ...post.toObject(),
        likes: likesCount,
        commentsCount
      };
    }));

    res.json(postsWithCounts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching latest posts" });
  }
};

export const createPost = async (req, res) => {
  try {
    const post = new Post({ ...req.body, author: req.user._id });
    await post.save();
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send({ error: "Error creating post" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user._id,
    });
    if (!post)
      return res.status(404).send({ error: "Post not found or unauthorized" });

    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "title",
      "content",
      "excerpt",
      "category",
      "coverImage",
      "isFeatured",
      "tags",
    ];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidOperation)
      return res.status(400).send({ error: "Invalid updates!" });

    updates.forEach((update) => (post[update] = req.body[update]));
    await post.save();
    res.send(post);
  } catch (error) {
    res.status(400).send({ error: "Error updating post" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id,
    });
    if (!post)
      return res.status(404).send({ error: "Post not found or unauthorized" });

    await Comment.deleteMany({ post: req.params.id });
    await Like.deleteMany({ post: req.params.id });
    res.send(post);
  } catch (error) {
    res.status(500).send({ error: "Error deleting post" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Post.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]);
    res.send(categories);
  } catch (error) {
    res.status(500).send({ error: "Error fetching categories" });
  }
};

export const getPopularCategories = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    
    const popularCategories = await Post.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { name: "$_id", count: 1, _id: 0 } },
    ]);

    // Add placeholder images (or store images in your database)
    const categoriesWithImages = popularCategories.map((category) => ({
      ...category,
      image: `https://source.unsplash.com/random/600x400/?${category.name.toLowerCase()}`,
    }));

    res.json(categoriesWithImages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching categories" });
  }
};

export const getPostsByCategory = async (req, res) => {
  try {
    const posts = await Post.find({ category: req.params.name })
      .sort({ createdAt: -1 })
      .populate("author", "name email bio");
      
    // Add counts
    const postsWithCounts = await Promise.all(posts.map(async (post) => {
      const likesCount = await Like.countDocuments({ post: post._id });
      const commentsCount = await Comment.countDocuments({ post: post._id });
      return {
        ...post.toObject(),
        likes: likesCount,
        commentsCount
      };
    }));
      
    res.send(postsWithCounts);
  } catch (error) {
    res.status(500).send({ error: "Error fetching posts for this category" });
  }
};

export const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).send({ error: "Search query is required" });

    const posts = await Post.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { excerpt: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } }
      ],
    })
      .sort({ createdAt: -1 })
      .populate("author", "name email bio");
      
    // Add counts
    const postsWithCounts = await Promise.all(posts.map(async (post) => {
      const likesCount = await Like.countDocuments({ post: post._id });
      const commentsCount = await Comment.countDocuments({ post: post._id });
      return {
        ...post.toObject(),
        likes: likesCount,
        commentsCount
      };
    }));

    res.send(postsWithCounts);
  } catch (error) {
    res.status(500).send({ error: "Error searching posts" });
  }
};

// Add a new function to get trending posts
export const getTrendingPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    // Get posts with most likes and comments, sort by combined score
    const posts = await Post.aggregate([
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "post",
          as: "likes"
        }
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "commentsArray"
        }
      },
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          commentsCount: { $size: "$commentsArray" },
          score: { $add: [{ $size: "$likes" }, { $multiply: [{ $size: "$commentsArray" }, 2] }, "$views"] }
        }
      },
      { $sort: { score: -1 } },
      { $limit: limit },
      { $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorObj" 
        }
      },
      {
        $addFields: {
          author: { $arrayElemAt: ["$authorObj", 0] }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          excerpt: 1,
          content: 1,
          coverImage: 1,
          category: 1,
          createdAt: 1,
          updatedAt: 1,
          likesCount: 1,
          commentsCount: 1,
          views: 1,
          score: 1,
          author: {
            _id: 1,
            name: 1,
            email: 1,
            bio: 1
          }
        }
      }
    ]);
    
    res.json(posts);
  } catch (error) {
    console.error("Error in getTrendingPosts:", error);
    res.status(500).json({ error: "Error fetching trending posts" });
  }
};

// Get posts by tag
export const getPostsByTag = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const posts = await Post.find({ tags: req.params.tag })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "name email bio");
      
    // Add counts
    const postsWithCounts = await Promise.all(posts.map(async (post) => {
      const likesCount = await Like.countDocuments({ post: post._id });
      const commentsCount = await Comment.countDocuments({ post: post._id });
      return {
        ...post.toObject(),
        likes: likesCount,
        commentsCount
      };
    }));
      
    res.send(postsWithCounts);
  } catch (error) {
    res.status(500).send({ error: "Error fetching posts for this tag" });
  }
};

// Get popular tags
export const getPopularTags = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const posts = await Post.find({ tags: { $exists: true, $ne: [] } });
    
    // Count tag occurrences
    const tagCounts = {};
    posts.forEach(post => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    // Convert to array and sort
    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    res.json(sortedTags);
  } catch (error) {
    res.status(500).json({ error: "Error fetching popular tags" });
  }
};
