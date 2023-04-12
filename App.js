const http = require('http');
const url = require('url');
const fs = require('fs');

const articles = require('./articles.json');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'GET' && parsedUrl.pathname === '/articles') {
    // Return all articles
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(articles));
  } else if (req.method === 'POST' && parsedUrl.pathname === '/articles') {
    // Create new article
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      const newArticle = JSON.parse(body);
      newArticle.id = articles.length + 1;
      articles.push(newArticle);
      fs.writeFile('./articles.json', JSON.stringify(articles), (err) => {
        if (err) {
          res.statusCode = 500;
          res.end('Error writing to file');
        } else {
          res.statusCode = 201;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(newArticle));
        }
      });
    });
  } else if (req.method === 'GET' && parsedUrl.pathname === '/articles/:id') {
    // Return article by ID
    const articleId = parseInt(parsedUrl.pathname.substring(10));
    const article = articles.find((a) => a.id === articleId);
    if (!article) {
      res.statusCode = 404;
      res.end('Article not found');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(article));
    }
  } else if (req.method === 'DELETE' && parsedUrl.pathname === '/articles/:id') {
    // Delete article by ID
    const articleId = parseInt(parsedUrl.pathname.substring(10));
    const index = articles.findIndex((a) => a.id === articleId);
    if (index === -1) {
      res.statusCode = 404;
      res.end('Article not found');
    } else {
      articles.splice(index, 1);
      fs.writeFile('./articles.json', JSON.stringify(articles), (err) => {
        if (err) {
          res.statusCode = 500;
          res.end('Error writing to file');
        } else {
          res.statusCode = 204;
          res.end();
        }
      });
    }
  } else {
    res.statusCode = 404;
    res.end('File not found');
  }
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
