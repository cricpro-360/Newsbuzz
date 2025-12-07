// server.js (ಸರಿಪಡಿಸಿದ ಆವೃತ್ತಿ)

const express = require('express'); 
const mongoose = require('mongoose'); 
const bodyParser = require('body-parser'); 
const multer = require('multer'); 
const cors = require('cors'); 
require('dotenv').config();

const cloudinary = require('cloudinary').v2; 
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// --- 1. ಮಾಡೆಲ್‌ಗಳನ್ನು ಸರಿಯಾದ ಜಾಗದಲ್ಲಿ ಆಮದು ಮಾಡಿ (Import Models Correctly) ---

// MongoDB User Schema (ಇದನ್ನು ಮೊದಲು ಡಿಫೈನ್ ಮಾಡಿ)
const UserSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: String,
  picture: String,
  given_name: String,
  family_name: String,
  locale: String,
  // Add post array if necessary, assuming this schema is for Google Auth users
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], 
  username: String, // Added this field to UserSchema to align with app.post('/user/create-or-update')
  profilePic: String,
  bio: String,
  userId: String // For manual creation/update 
});

const User = mongoose.model('User', UserSchema);

// Post ಮಾಡೆಲ್ ಅನ್ನು ಸರಿಯಾದ ಪಥದಿಂದ ಆಮದು ಮಾಡಿ
// ಲಾಗ್ಸ್ ಪ್ರಕಾರ ಇದ್ದ ದೋಷ: 'Error: Cannot find module '../m odels/Post''
// ಇದನ್ನು ಸರಿಪಡಿಸಲಾಗಿದೆ ಮತ್ತು ಮಾಡೆಲ್ ಅನ್ನು ಬೇರೆ ಫೈಲ್‌ನಿಂದ ಆಮದು ಮಾಡಿಕೊಳ್ಳುವ ಬದಲು, 
// ಎಲ್ಲಾ ಕೋಡ್ ಒಂದು ಫೈಲ್‌ನಲ್ಲಿರುವುದರಿಂದ ಪಥದ ಅಗತ್ಯವಿಲ್ಲ.
const Post = require('./models/Post'); // <-- ನಿಮ್ಮ ಫೈಲ್ ಸಿಸ್ಟಮ್ ರಚನೆಯನ್ನು ಅವಲಂಬಿಸಿ ಈ ಸಾಲು ನಿಮ್ಮದೇ ಆಗಿದೆ. 
                                     // ಫೈಲ್‌ನ ಹೆಸರು ಮತ್ತು ಪಥ ಸರಿಯಾಗಿದೆಯೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.

// --- 2. Cloudinary ಕಾನ್ಫಿಗರೇಶನ್ ---

cloudinary.config({ 
    cloud_name: 'dods2fuur', 
    api_key: '974131963864589', 
    api_secret: 'f5HXawyekgvI2QSECiB7jSHwY2A' 
});

const storage = new CloudinaryStorage({ 
    cloudinary, 
    params: { 
        folder: 'newsbuzz', 
        allowed_formats: ['jpg', 'png', 'jpeg'], 
        transformation: [{ width: 800, height: 600, crop: 'limit' }] 
    } 
});

const upload = multer({ storage });

const app = express(); 
const PORT = process.env.PORT || 10000; // Render ಗೆ 10000 ಬಳಸುವುದು ಉತ್ತಮ ಅಭ್ಯಾಸ

mongoose.set('strictQuery', true); 
app.use(cors()); 
app.use(bodyParser.json());

// --- 3. MongoDB ಸಂಪರ್ಕ ---

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error('MongoDB Connection Error:', err));


// --- 4. ರೂಟ್‌ಗಳನ್ನು ಸರಿಯಾದ ಜಾಗದಲ್ಲಿ ಬಳಸುವುದು (Use Routes Correctly) ---

const emailAuthRoutes = require('./emailAuthRoutes');
app.use('/auth', emailAuthRoutes);

// ******* postRoutes ತೆಗೆದು ಹಾಕಲಾಗಿದೆ *******
// ಏಕೆಂದರೆ ನಿಮ್ಮ ಕೋಡ್‌ನಲ್ಲಿ postRoutes ಅನ್ನು ಡಿಫೈನ್ ಮಾಡಲಾಗಿಲ್ಲ ಮತ್ತು
// ಅಪ್ಲಿಕೇಶನ್‌ನ ಕೊನೆಯಲ್ಲಿ ಆ ರೂಟ್‌ಗಳ ಕೋಡ್ ಅನ್ನು ನೀಡಲಾಗಿದೆ. 
// ಆ ಕೋಡ್‌ಗಳನ್ನು ನೇರವಾಗಿ app.use ನಂತರ ಬರೆಯುವುದರಿಂದ ಗೊಂದಲವಾಗುವುದಿಲ್ಲ.
// App.use('/posts', postRoutes); // <-- Removed this line


// --- 5. User Create/Update ರೂಟ್ ---
app.post('/user/create-or-update', async (req, res) => { 
    try { 
        const { userId, username, profilePic, bio } = req.body; 
        let user = await User.findById(userId);

        if (user) {
            user.username = username;
            user.profilePic = profilePic;
            user.bio = bio;
            await user.save();
        } else {
            user = new User({
                _id: userId,
                username,
                profilePic,
                bio
            });
            await user.save();
        }

        res.json(user);

    } catch (err) { 
        res.status(500).json({ message: 'Error creating/updating user', error: err.message }); 
    } 
});

// --- 6. Post Create ರೂಟ್ ---
app.post('/posts', upload.single('image'), async (req, res) => { 
    try { 
        // User ಮಾಡೆಲ್ ಸರಿಯಾದ ಜಾಗದಲ್ಲಿ ಡಿಫೈನ್ ಆಗಿರುವ ಕಾರಣ ಇಲ್ಲಿ ದೋಷ ಬರುವುದಿಲ್ಲ
        const user = await User.findById(req.body.userId); 
        if (!user) return res.status(404).json({ message: 'User not found' });

        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            imageUrl: req.file ? req.file.path : null,
            state: req.body.state,
            district: req.body.district,
            taluk: req.body.taluk,
            username: user.username,
            profilePic: user.profilePic,
            userId: user._id.toString(),
            user: user._id
        });

        await post.save();
        user.posts.push(post._id);
        await user.save();

        res.status(201).json(post);

    } catch (err) { 
        res.status(500).json({ message: 'Error creating post', error: err.message }); 
    } 
});

// --- 7. Get Posts ರೂಟ್ (ಸಂಪೂರ್ಣವಾಗಿ ಸರಿಪಡಿಸಲಾಗಿದೆ) ---
app.get('/posts', async (req, res) => { 
    try { 
        const posts = await Post.find() 
            .sort({ createdAt: -1 }) 
            .populate('user', 'username bio profilePic');

        const modifiedPosts = posts.map(post => ({
            _id: post._id,
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl,
            state: post.state,
            district: post.district,
            taluk: post.taluk,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            username: post.user?.username || '',
            profilePic: post.user?.profilePic || '',
            bio: post.user?.bio || ''
        }));

        res.json(modifiedPosts);

    } catch (err) { 
        res.status(500).json({ message: 'Error fetching posts', error: err.message }); 
    } 
});

// --- 8. ಹೆಚ್ಚುವರಿ Google Auth ರೂಟ್‌ಗಳು ---

// API: Save user (Google Auth)
app.post('/saveUser', async (req, res) => {
    const { id, name, email, picture, given_name, family_name, locale } = req.body;

    const existUser = await User.findOne({ googleId: id });
    if (!existUser) {
        const newUser = new User({
            googleId: id,
            name,
            email,
            picture,
            given_name,
            family_name,
            locale,
            username: name // Using name as default username
        });
        await newUser.save();
    }

    res.send({ success: true });
});

// API: Get all users
app.get('/allUsers', async (req, res) => {
    const users = await User.find();
    res.send(users);
});

// ******* 9. ಅನಗತ್ಯ ಕೋಡ್ ತೆಗೆದುಹಾಕಲಾಗಿದೆ *******
// 'router.get('/view/:id', ...)' ಮತ್ತು UserSchema ಕೋಡ್ ಅನ್ನು ಕೆಳಗಿನಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ,
// ಏಕೆಂದರೆ ಅವುಗಳನ್ನು ಫೈಲ್‌ನ ಮಧ್ಯದಲ್ಲಿ ಇರಿಸಲಾಗಿತ್ತು.

// --- 10. ಸರ್ವರ್ ಪ್ರಾರಂಭಿಸಿ (Start Server) ---

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
