fetch('https://newsbuzz.onrender.com/articles')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('news-container');
    data.articles.forEach(article => {
      const div = document.createElement('div');
      div.innerHTML = `<h3>${article.title}</h3><p>${article.content}</p>`;
      container.appendChild(div);
    });
  })
  .catch(error => console.error('Error loading articles:', error));
