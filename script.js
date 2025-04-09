// Get DOM elements
const postForm = document.getElementById('postForm');
const postTitle = document.getElementById('postTitle');
const postContent = document.getElementById('postContent');
const postsList = document.getElementById('postsList');

// Initialize posts array (retrieving from localStorage)
let posts = JSON.parse(localStorage.getItem('posts')) || [];

// Display all posts on the page
function displayPosts() {
  postsList.innerHTML = '';
  posts.forEach((post, index) => {
    const postDiv = document.createElement('div');
    postDiv.classList.add('post');
    postDiv.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <button onclick="deletePost(${index})">Delete</button>
    `;
    postsList.appendChild(postDiv);
  });
}

// Handle post submission
postForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const newPost = {
    title: postTitle.value,
    content: postContent.value
  };

  posts.push(newPost);  // Add new post to the array

  // Save posts array to localStorage
  localStorage.setItem('posts', JSON.stringify(posts));

  // Reset form fields
  postTitle.value = '';
  postContent.value = '';

  // Display the updated posts
  displayPosts();
});

// Delete a post
function deletePost(index) {
  posts.splice(index, 1);  // Remove the post at the given index

  // Update localStorage and re-display posts
  localStorage.setItem('posts', JSON.stringify(posts));
  displayPosts();
}

// Display posts when the page loads
displayPosts();
