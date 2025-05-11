
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";

export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const sortOptions = {};
    sortOptions[sort] = order === "asc" ? 1 : -1;
    
    const posts = await Post.find({})
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "name email bio")
      .populate({
        path: "comments",
        options: { limit: 2, sort: { createdAt: -1 } },
        populate: { path: "author", select: "name email" },
      });
    
    const total = await Post.countDocuments();
    
    res.send({
      posts,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
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
    
    res.send(post);
  } catch (error) {
    res.status(500).send({ error: "Error fetching post" });
  }
};

export const getFeaturedPosts = async (req, res) => {
  try {
    const { limit = 2 } = req.query;
    const featuredPosts = await Post.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("author", "name email bio");
    res.json(featuredPosts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching featured posts" });
  }
};

export const getLatestPosts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const latestPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("author", "name email bio");

    res.json(latestPosts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching latest posts" });
  }
};

export const createPost = async (req, res) => {
  try {
    const post = new Post({ ...req.body, author: req.user._id });
    await post.save();
    await post.populate("author", "name email bio");
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send({ error: "Error creating post", details: error.message });
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
    const { limit = 4 } = req.query;
    const popularCategories = await Post.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
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
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = await Post.find({ category: req.params.name })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "name email bio");
      
    const total = await Post.countDocuments({ category: req.params.name });
    
    res.send({
      posts,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
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
      ],
    })
      .sort({ createdAt: -1 })
      .populate("author", "name email bio");

    res.send(posts);
  } catch (error) {
    res.status(500).send({ error: "Error searching posts" });
  }
};

// New routes for post interactions
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send({ error: "Post not found" });
    
    const userLiked = post.likes.includes(req.user._id);
    
    if (userLiked) {
      // Unlike the post
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Like the post
      post.likes.push(req.user._id);
    }
    
    await post.save();
    res.send({ likes: post.likes.length, liked: !userLiked });
  } catch (error) {
    res.status(500).send({ error: "Error processing like action" });
  }
};

export const bookmarkPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send({ error: "Post not found" });
    
    const userBookmarked = post.bookmarks.includes(req.user._id);
    
    if (userBookmarked) {
      // Remove bookmark
      post.bookmarks = post.bookmarks.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Add bookmark
      post.bookmarks.push(req.user._id);
    }
    
    await post.save();
    res.send({ bookmarked: !userBookmarked });
  } catch (error) {
    res.status(500).send({ error: "Error processing bookmark action" });
  }
};

export const getUserBookmarks = async (req, res) => {
  try {
    const bookmarkedPosts = await Post.find({ bookmarks: req.user._id })
      .sort({ createdAt: -1 })
      .populate("author", "name email bio");
    
    res.send(bookmarkedPosts);
  } catch (error) {
    res.status(500).send({ error: "Error fetching bookmarked posts" });
  }
};

export const getTrendingPosts = async (req, res) => {
  try {
    const { days = 7, limit = 5 } = req.query;
    const date = new Date();
    date.setDate(date.getDate() - parseInt(days));
    
    const trendingPosts = await Post.find({ createdAt: { $gte: date } })
      .sort({ views: -1, "likes.length": -1 })
      .limit(parseInt(limit))
      .populate("author", "name email bio");
      
    res.send(trendingPosts);
  } catch (error) {
    res.status(500).send({ error: "Error fetching trending posts" });
  }
};
