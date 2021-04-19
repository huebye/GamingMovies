const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.static('public'));
app.use(morgan('common'));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something must have gone wrong!');
});

let topMovies = [
  {
    title: 'Harry Potter and the Sorcerer\'s Stone',
    author: 'J.K. Rowling'
  },
  {
    title: 'Focus',
    author: 'John Requa'
  },
  {
    title: 'Twilight',
    author: 'Stephanie Meyer'
  },
  {
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    author: 'J.R.R. Tolkien'
  },
  {
    title: 'The Lord of the Rings: The Two Towers ',
    author: 'J.R.R. Tolkien'
  },
  {
    title: 'The Lord of the Rings: The Return of the King',
    author: 'J.R.R. Tolkien'
  },
  {
    title: 'The Hobbit: An Unexpected Journey',
    author: 'J.R.R. Tolkien'
  },
  {
    title: 'The Hobbit: The Desolation of Smaug ',
    author: 'J.R.R. Tolkien'
  },
  {
    title: 'The Hobbit: The Battle of the Five Armies',
    author: 'J.R.R. Tolkien'
  },
  {
    title: 'Tenet',
    author: 'Christopher Nolan'
  }
];


// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my movie club!');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});


// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
