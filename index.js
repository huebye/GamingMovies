const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();

const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

app.use(express.static('public'));
app.use(morgan('common'));
app.use(bodyParser.json());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something must have gone wrong!');
});

mongoose.connect('mongodb://localhost:27017/[gamingMovies]', { useNewUrlParser: true, useUnifiedTopology: true });

//GET requests
app.get('/', (req, res) => {
  res.send('public/index.html');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

// USERS

//Get all users.
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Add a user.
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//Get a user by name.
app.get('/users/:Name', (req, res) => {
  Users.findOne({ Name: req.params.Name })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Delete a user by name.
app.delete('/users/:Name', (req, res) => {
  Users.findOneAndRemove({ Name: req.params.Name })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Name + ' was not found');
      } else {
        res.status(200).send(req.params.Name + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Update a user's info, by name.
app.put('/users/:Name', (req, res) => {
  Users.findOneAndUpdate({ Name: req.params.Name }, { $set:
    {
      Name: req.body.Name,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true },
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Add a movie to a user's list of favorites.
app.post('/users/:Name/Movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Name: req.params.Name }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true },
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// MOVIES

// Get all movies.
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Get the data about a movie, by title.
app.get('/movies/:Title', (req, res) => {
  Movies.findOne({ Title: req.params.Title})
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) =>{
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Get the data about the director of a movie, by name.
app.get('/movies/director/:Name', (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name})
    .then((director) => {
      res.json(director);
    })
    .catch((err) =>{
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Get the data about the genre of a movie, by name.
app.get('/movies/genre/:Name', (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name})
    .then((genre) => {
      res.json(genre);
    })
    .catch((err) =>{
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Add a movie to list.
app.post('/movies', (req, res) => {
  Movies.findOne({ Title: req.body.Title})
    .then((movies) => {
      if (movies) {
        return res.status(400).send(req.body.Title + ' already exists!');
      } else {
        Movies
          .create({
            Title: req.body.Title,
            Description: req.body.Description
          })
          .then((movies) =>{res.status(201).json(movies)})
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//Delete a movie by title
app.delete('/movies/:Title', (req, res) => {
  Movies.findOneAndRemove({ Title: req.params.Title})
    .then((movies) => {
      if (!movies) {
        res.status(400).send(req.params.Title + ' was not found!');
      } else {
        res.status(200).send(req.params.Title +' was deleted!');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Your app is listening on port 8080.');
});
