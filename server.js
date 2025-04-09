const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Use your MongoDB Atlas URL for deployment
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = 'post_app';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let db, posts;

MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    posts = db.collection('posts');
    console.log("Connected to MongoDB");
  })
  .catch(err => console.error("MongoDB connection failed:", err));

app.get('/api/posts', async (req, res) => {
  try {
    const allPosts = await posts.find().toArray();
    res.json(allPosts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/posts', async (req, res) => {
  const { username, title, content } = req.body;
  if (!username || !title || !content) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    await posts.insertOne({ username, title, content });
    res.json({ message: 'Post created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
