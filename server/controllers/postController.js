import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate("author", "name email bio");
    res.send(posts);
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
    res.send(post);
  } catch (error) {
    res.status(500).send({ error: "Error fetching post" });
  }
};

export const getFeaturedPosts = async (req, res) => {
  try {
    const featuredPosts = await Post.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(2)
      .populate("author", "name email bio");
    res.json(featuredPosts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching featured posts" });
  }
};

export const getLatestPosts = async (req, res) => {
  try {
    const latestPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
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
    const popularCategories = await Post.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 4 },
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
    res.send(posts);
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
      ],
    })
      .sort({ createdAt: -1 })
      .populate("author", "name email bio");

    res.send(posts);
  } catch (error) {
    res.status(500).send({ error: "Error searching posts" });
  }
};
