import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.send(comments);
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
