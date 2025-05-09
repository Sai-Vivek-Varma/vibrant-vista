
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vibrantvista')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Load models
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// Routes

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate token
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET || 'your_jwt_secret');

    res.status(201).send({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).send({ message: 'Error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET || 'your_jwt_secret');

    res.send({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).send({ message: 'Error during login' });
  }
});

// User Routes
app.get('/api/users/me', auth, async (req, res) => {
  res.send(req.user);
});

app.put('/api/users/profile', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'bio'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(400).send({ error: 'Update failed' });
  }
});

// Post Routes
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('author', 'name email bio');
      
    res.send(posts);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching posts' });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email bio')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name email'
        }
      });
      
    if (!post) {
      return res.status(404).send({ error: 'Post not found' });
    }
    
    res.send(post);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching post' });
  }
});

app.post('/api/posts', auth, async (req, res) => {
  try {
    const post = new Post({
      ...req.body,
      author: req.user._id
    });
    
    await post.save();
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send({ error: 'Error creating post' });
  }
});

app.put('/api/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.user._id });
    
    if (!post) {
      return res.status(404).send({ error: 'Post not found or you are not authorized' });
    }
    
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'content', 'excerpt', 'category', 'coverImage'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' });
    }
    
    updates.forEach(update => post[update] = req.body[update]);
    await post.save();
    
    res.send(post);
  } catch (error) {
    res.status(400).send({ error: 'Error updating post' });
  }
});

app.delete('/api/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    
    if (!post) {
      return res.status(404).send({ error: 'Post not found or you are not authorized' });
    }
    
    // Delete associated comments
    await Comment.deleteMany({ post: req.params.id });
    
    res.send(post);
  } catch (error) {
    res.status(500).send({ error: 'Error deleting post' });
  }
});

// Comment Routes
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
      
    res.send(comments);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching comments' });
  }
});

app.post('/api/posts/:id/comments', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).send({ error: 'Post not found' });
    }
    
    const comment = new Comment({
      content: req.body.content,
      author: req.user._id,
      post: req.params.id
    });
    
    await comment.save();
    
    post.comments.push(comment._id);
    await post.save();
    
    // Populate author info before sending response
    await comment.populate('author', 'name email');
    
    res.status(201).send(comment);
  } catch (error) {
    res.status(400).send({ error: 'Error adding comment' });
  }
});

app.put('/api/posts/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findOne({ 
      _id: req.params.commentId, 
      post: req.params.postId,
      author: req.user._id 
    });
    
    if (!comment) {
      return res.status(404).send({ error: 'Comment not found or you are not authorized' });
    }
    
    comment.content = req.body.content;
    await comment.save();
    
    await comment.populate('author', 'name email');
    
    res.send(comment);
  } catch (error) {
    res.status(400).send({ error: 'Error updating comment' });
  }
});

app.delete('/api/posts/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({ 
      _id: req.params.commentId, 
      post: req.params.postId,
      author: req.user._id 
    });
    
    if (!comment) {
      return res.status(404).send({ error: 'Comment not found or you are not authorized' });
    }
    
    // Remove comment reference from post
    await Post.findByIdAndUpdate(req.params.postId, {
      $pull: { comments: req.params.commentId }
    });
    
    res.send(comment);
  } catch (error) {
    res.status(500).send({ error: 'Error deleting comment' });
  }
});

// Category Routes
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Post.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', count: 1 } },
      { $sort: { count: -1 } }
    ]);
    
    res.send(categories);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching categories' });
  }
});

app.get('/api/categories/:name/posts', async (req, res) => {
  try {
    const posts = await Post.find({ category: req.params.name })
      .sort({ createdAt: -1 })
      .populate('author', 'name email bio');
      
    res.send(posts);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching posts for this category' });
  }
});

// Search Route
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).send({ error: 'Search query is required' });
    }
    
    const posts = await Post.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
      ]
    })
    .sort({ createdAt: -1 })
    .populate('author', 'name email bio');
    
    res.send(posts);
  } catch (error) {
    res.status(500).send({ error: 'Error searching posts' });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
