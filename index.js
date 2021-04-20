const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();

app.use(express.static('public'));
app.use(morgan('common'));
app.use(bodyParser.json());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something must have gone wrong!');
});

let topMovies = [
  {
    title: 'Harry Potter and the Sorcerer\'s Stone',
    director: 'J.K. Rowling',
    genre: 'Fantasy'
  },
  {
    title: 'Focus',
    director: 'John Requa',
    genre: 'Action'
  },
  {
    title: 'Twilight',
    director: 'Stephanie Meyer',
    genre: 'Fantasy'
  },
  {
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    director: 'Peter Jackson',
    genre: 'Fantasy'
  },
  {
    title: 'The Lord of the Rings: The Two Towers',
    director: 'Peter Jackson',
    genre: 'Fantasy'
  },
  {
    title: 'The Lord of the Rings: The Return of the King',
    director: 'Peter Jackson',
    genre: 'Fantasy'
  },
  {
    title: 'The Hobbit: An Unexpected Journey',
    director: 'Peter Jackson',
    genre: 'Fantasy'
  },
  {
    title: 'The Hobbit: The Desolation of Smaug ',
    director: 'Peter Jackson',
    genre: 'Fantasy'
  },
  {
    title: 'The Hobbit: The Battle of the Five Armies',
    director: 'Peter Jackson',
    genre: 'Fantasy'
  },
  {
    title: 'Tenet',
    director: 'Christopher Nolan',
    genre: 'Thriller'
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

// Get the data about a movie, by title.

app.get('/movies/:title', (req, res) => {
  res.json(topMovies.find((movie) =>
    { return movie.title === req.params.title }));
});

// Get the data about the director of a movie, by name.

app.get('/movies/:director', (req, res) => {
  res.json(topMovies.find((movie) =>
    { return movie.director === req.params.director }));
});

// Get the data about the genre of a movie, by name.

app.get('/movies/:genre', (req, res) => {
  res.json(topMovies.find((movie) =>
    { return movie.genre === req.params.genre }));
});

// Add movie to the list, by name.

app.post('/movies', (req, res) => {
  let newMovie = req.body;

  if (!newMovie.title) {
    const message = 'Missing title in request body';
    res.status(400).send(message);
  } else {
    topMovies.push(newMovie);
    res.status(201).send('The Movie ' + req.body.title + ' was added succesfully!');
  }
});

// Deletes movie from the list of movies, by title.

app.delete('/movies/:title', (req, res) =>{
  let movie = topMovies.find((movie) => {
    return movie.title === req.params.title
  });
  if (movie) {
    topMovies = topMovies.filter((obj) =>{
      return obj.title !== req.params.title
    });
    res.status(201).send('Movie ' + req.params.title + ' was deleted.');
  }
});

const port = process.env.PORT || 8080;
// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
