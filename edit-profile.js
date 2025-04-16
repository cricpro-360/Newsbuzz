<!DOCTYPE html>
<html lang="kn">
<head>
  <meta charset="UTF-8">
  <title>ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ</title>
</head>
<body>
  <h2>ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ</h2>

  <input type="text" id="username" placeholder="ಹೆಸರು">
  <input type="file" id="profilePic" accept="image/*">
  <button onclick="updateProfile()">ಸಂಪಾದಿಸಿ</button>

  <script>
    const API_URL = 'https://newsbuzz-1.onrender.com';
    const token = localStorage.getItem('token');
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));

    function updateProfile() {
      const username = document.getElementById('username').value.trim();
      const profilePic = document.getElementById('profilePic').files[0];

      const formData = new FormData();
      if (username) formData.append('username', username);
      if (profilePic) formData.append('profilePic', profilePic);

      fetch(`${API_URL}/users/edit/${userProfile.userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Update localStorage
          localStorage.setItem('userProfile', JSON.stringify({
            userId: data.user._id,
            username: data.user.username,
            profilePic: data.user.profilePic
          }));
          alert('ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!');
        }
      });
    }
  </script>
</body>
</html>
