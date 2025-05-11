
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

export const getComments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const comments = await Comment.find({ post: req.params.id })
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Comment.countDocuments({ post: req.params.id });
    
    res.send({
      comments,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).send({ error: "Error fetching comments" });
  }
};

export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send({ error: "Post not found" });

    const comment = new Comment({
      content: req.body.content,
      author: req.user._id,
      post: req.params.id,
    });

    await comment.save();
    post.comments.push(comment._id);
    await post.save();

    await comment.populate("author", "name email");
    res.status(201).send(comment);
  } catch (error) {
    res.status(400).send({ error: "Error adding comment" });
  }
};

export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.commentId,
      post: req.params.postId,
      author: req.user._id,
    });

    if (!comment)
      return res
        .status(404)
        .send({ error: "Comment not found or unauthorized" });

    comment.content = req.body.content;
    await comment.save();
    await comment.populate("author", "name email");
    res.send(comment);
  } catch (error) {
    res.status(400).send({ error: "Error updating comment" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({
      _id: req.params.commentId,
      post: req.params.postId,
      author: req.user._id,
    });

    if (!comment)
      return res
        .status(404)
        .send({ error: "Comment not found or unauthorized" });

    await Post.findByIdAndUpdate(req.params.postId, {
      $pull: { comments: req.params.commentId },
    });

    res.send(comment);
  } catch (error) {
    res.status(500).send({ error: "Error deleting comment" });
  }
};

// New comment interaction routes
export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).send({ error: "Comment not found" });
    
    const userLiked = comment.likes.includes(req.user._id);
    
    if (userLiked) {
      // Unlike the comment
      comment.likes = comment.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Like the comment
      comment.likes.push(req.user._id);
    }
    
    await comment.save();
    res.send({ likes: comment.likes.length, liked: !userLiked });
  } catch (error) {
    res.status(500).send({ error: "Error processing comment like action" });
  }
};

export const addReplyToComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).send({ error: "Comment not found" });
    
    const reply = {
      content: req.body.content,
      author: req.user._id,
      createdAt: new Date()
    };
    
    comment.replies.push(reply);
    await comment.save();
    
    // Populate the author of the reply
    const updatedComment = await Comment.findById(req.params.commentId)
      .populate("author", "name email")
      .populate("replies.author", "name email");
      
    res.status(201).send(updatedComment);
  } catch (error) {
    res.status(400).send({ error: "Error adding reply to comment" });
  }
};

export const likeReply = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).send({ error: "Comment not found" });
    
    const reply = comment.replies.id(req.params.replyId);
    if (!reply) return res.status(404).send({ error: "Reply not found" });
    
    const userLiked = reply.likes.includes(req.user._id);
    
    if (userLiked) {
      // Unlike the reply
      reply.likes = reply.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Like the reply
      reply.likes.push(req.user._id);
    }
    
    await comment.save();
    res.send({ likes: reply.likes.length, liked: !userLiked });
  } catch (error) {
    res.status(500).send({ error: "Error processing reply like action" });
  }
};
