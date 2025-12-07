// server.js (FULLY FIXED)

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: "dods2fuur",
  api_key: "974131963864589",
  api_secret: "f5HXawyekgvI2QSECiB7jSHwY2A",
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "newsbuzz",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.set("strictQuery", true);
app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// MODELS
const Post = require("./models/Post");
const User = require("./models/User");

// ROUTES
const emailAuthRoutes = require("./emailAuthRoutes");
app.use("/auth", emailAuthRoutes);

const postRoutes = require("./postRoutes");
app.use("/posts", postRoutes);

// Basic home route
app.get("/", (req, res) => {
  res.send("NewsBuzz Server Running 🚀");
});

// SAVE USER (Google Auth)
app.post("/saveUser", async (req, res) => {
  try {
    const { id, name, email, picture, given_name, family_name, locale } = req.body;

    let user = await User.findOne({ googleId: id });
    if (!user) {
      user = new User({
        googleId: id,
        name,
        email,
        picture,
        given_name,
        family_name,
        locale,
      });
      await user.save();
    }
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ error: "User save failed" });
  }
});

// GET ALL USERS
app.get("/allUsers", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

// START SERVER
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
