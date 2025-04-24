<script defer>
    const API_URL = 'https://newsbuzz-1.onrender.com';

    const locationData = {
      'ಕರ್ನಾಟಕ': {
        'ಮೈಸೂರು': ['ಮೈಸೂರು ನಗರ', 'ನಂಜನಗೂಡು'],
        'ಹುಬ್ಬಳ್ಳಿ': ['ಹುಬ್ಬಳ್ಳಿ ಉತ್ತರ', 'ನವಲಗುಂದ']
      }
    };

    function updateDistrictFilter() {
      const state = document.getElementById('state-filter').value;
      const districtSelect = document.getElementById('district-filter');
      const talukSelect = document.getElementById('taluk-filter');
      districtSelect.innerHTML = '<option value="">ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ</option>';
      talukSelect.innerHTML = '<option value="">ತಾಲೂಕು ಆಯ್ಕೆಮಾಡಿ</option>';

      if (locationData[state]) {
        Object.keys(locationData[state]).forEach(district => {
          const option = document.createElement('option');
          option.value = district;
          option.textContent = district;
          districtSelect.appendChild(option);
        });
      }
    }

    function updateTalukFilter() {
      const state = document.getElementById('state-filter').value;
      const district = document.getElementById('district-filter').value;
      const talukSelect = document.getElementById('taluk-filter');
      talukSelect.innerHTML = '<option value="">ತಾಲೂಕು ಆಯ್ಕೆಮಾಡಿ</option>';

      if (locationData[state] && locationData[state][district]) {
        locationData[state][district].forEach(taluk => {
          const option = document.createElement('option');
          option.value = taluk;
          option.textContent = taluk;
          talukSelect.appendChild(option);
        });
      }
    }

    function loadPosts() {
      const state = document.getElementById('state-filter').value;
      const district = document.getElementById('district-filter').value;
      const taluk = document.getElementById('taluk-filter').value;

      let url = `${API_URL}/posts?limit=10`;
      const params = [];

      if (state) params.push(`state=${encodeURIComponent(state)}`);
      if (district) params.push(`district=${encodeURIComponent(district)}`);
      if (taluk) params.push(`taluk=${encodeURIComponent(taluk)}`);

      if (params.length > 0) url += `&${params.join('&')}`;

      const cacheKey = `state=${state}&district=${district}&taluk=${taluk}`;
      const cached = JSON.parse(localStorage.getItem("filteredPostsCache"));
      const cacheTime = localStorage.getItem("filteredPostsTime");
      const cacheTTL = 5 * 60 * 1000; // 5 minutes

      if (cached && cached.key === cacheKey && cacheTime && (Date.now() - cacheTime < cacheTTL)) {
        renderPosts(cached.data);
        return;
      }

      fetch(url)
        .then(res => res.json())
        .then(posts => {
          localStorage.setItem("filteredPostsCache", JSON.stringify({ key: cacheKey, data: posts }));
          localStorage.setItem("filteredPostsTime", Date.now());
          renderPosts(posts);
        })
        .catch(() => {
          document.getElementById('posts').innerHTML = '<p class="error-text">ಪೋಸ್ಟ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ.</p>';
        });
    }

    function renderPosts(posts) {
      const postDiv = document.getElementById('posts');
      postDiv.innerHTML = '';

      if (!posts.length) {
        postDiv.innerHTML = '<p class="no-posts">ಯಾವುದೇ ಪೋಸ್ಟ್‌ಗಳು ಲಭ್ಯವಿಲ್ಲ.</p>';
        return;
      }

      posts.forEach(post => {
        const date = new Date(post.createdAt).toLocaleString();
        postDiv.innerHTML += `
          <div class="user-info">
            <img src="${post.profilePic}" width="40" height="40">
            <a href="profile-view.html?user=${post.userId}">${post.username}</a>
          </div>
          <div class="post">
            <h3>${post.title}</h3>
            <p class="preview">${post.content}</p>
            <a href="post.html?id=${post._id}" class="post-link" target="_blank">ಮತ್ತಷ್ಟು ಓದಿ</a>
            ${post.imageUrl ? `<img src="${post.imageUrl.replace('/upload/', '/upload/w_400/')}" class="post-image">` : ''}
            <small>Posted on ${date}</small>
          </div>`;
      });
    }

    function handleStateChange() {
      const state = document.getElementById('state-filter').value;
      localStorage.setItem('filterState', state);
      updateDistrictFilter();
      setTimeout(() => {
        const savedDistrict = localStorage.getItem('filterDistrict');
        if (savedDistrict) {
          document.getElementById('district-filter').value = savedDistrict;
          updateTalukFilter();
          setTimeout(() => {
            const savedTaluk = localStorage.getItem('filterTaluk');
            if (savedTaluk) {
              document.getElementById('taluk-filter').value = savedTaluk;
            }
            loadPosts();
          }, 100);
        } else {
          loadPosts();
        }
      }, 100);
    }

    function handleDistrictChange() {
      const district = document.getElementById('district-filter').value;
      localStorage.setItem('filterDistrict', district);
      updateTalukFilter();
      setTimeout(() => {
        const savedTaluk = localStorage.getItem('filterTaluk');
        if (savedTaluk) {
          document.getElementById('taluk-filter').value = savedTaluk;
        }
        loadPosts();
      }, 100);
    }

    function handleTalukChange() {
      const taluk = document.getElementById('taluk-filter').value;
      localStorage.setItem('filterTaluk', taluk);
      loadPosts();
    }

    window.onload = () => {
      const savedState = localStorage.getItem('filterState');
      if (savedState) {
        document.getElementById('state-filter').value = savedState;
        handleStateChange();
      } else {
        loadPosts();
      }
    };
  </script>
