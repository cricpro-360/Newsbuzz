// Get all posts by a specific user
app.get('/posts/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching user posts:', err);
    res.status(500).json({ message: 'ಸರ್ವರ್ ದೋಷ.' });
  }
});
