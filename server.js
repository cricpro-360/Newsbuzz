// Importing required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Create an instance of Express app
const app = express();

// Use body-parser middleware to parse incoming JSON requests
app.use(bodyParser.json());

// MongoDB connection (using MongoDB Atlas or local MongoDB)
mongoose.connect('mongodb://localhost:27017/postsDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define the schema for posts (title, content, and date)
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  date: { type: Date, default: Date.now }
});

// Create a model based on the schema
const Post = mongoose.model('Post', postSchema);

// Route to get all posts (GET /posts)
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find();  // Fetch all posts from the database
    res.json(posts);  // Send the posts as JSON
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Route to create a new post (POST /posts)
app.post('/posts', async (req, res) => {
  const { title, content } = req.body;

  // Check if title and content are provided
  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  const newPost = new Post({ title, content });

  try {
    await newPost.save();  // Save the post to the database
    res.status(201).json(newPost);  // Send the created post as response
  } catch (err) {
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Port to listen on (default: 3000)
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
