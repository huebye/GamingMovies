const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const passport = require('passport');
require('./middleware/passport.js');
const { check, validationResult } = require('express-validator');

const mongoose = require('mongoose');
const Models = require('./database/models.js');
const Movies = Models.Movie;
const Users = Models.User;

app.use(cors());
app.use(express.static('public'));
app.use(morgan('common'));
app.use(bodyParser.json());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something must have gone wrong!');
});
let auth = require('./middleware/auth.js')(app);

//mongoose.connect('mongodb://localhost:27017/[gamingMovies]', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

/**
 * defining /user endpoints 
 * @param {function} passport.auth - passport library method that authenticates user before making an endpoint call
 * @param {object} req - request defined from user
 * @param {object} res - response defined that is being send to the user
 */


/**
  * defining endpoint for index.html
  * @method getAllUser
  * @return index.html
  */
app.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
   // next step only initialised when user authorized
  res.send('public/index.html');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});


/*
defining all /users endpoints 
*/

/**
  * get all users
  * @method getAllUser
  * @return {object|arry} data from mopvieAPI
  */
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {       
   // next step only initialised when user authorized
  Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
  * register new user
  * @method registerUser
  * @param {string} Name - name of user
  * @param {string} Password - password of user
  * @param {string} Email - email of user
  * @param {date} Birthday - birthdate of user
  * @return {object} data from mopvieAPI
  */
app.post('/users',[                                                                  
    check('Name', 'Username is required').isLength({min: 5}),
    check('Name', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Name: req.body.Name })
    .then((user) => {
      if (user) {
        return res.status(409).send(req.body.Name + ' already exists');
      } else {
        Users
          .create({
            Name: req.body.Name,
            Password: hashedPassword,
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

/**
  * get a user by name.
  * @method getUserByName
  * @param {string} Name - name of user
  * @return {object} data from mopvieAPI
  */
app.get('/users/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {    
  // next step only initialised when user authorized
  Users.findOne({ Name: req.params.Name })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
  * delete a user by name
  * @method deleteUser
  * @param {string} Name - name of user
  * @return responds status
  */
app.delete('/users/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {   
 // next step only initialised when user authorized
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

/**
  * delete favroite movie from user with movie_id
  * @method deleteFavoriteMovie
  * @param {string} Name - name of movie
  * @param {string} MovieID - movie_id from movie 
  * @return responds status
  */
app.delete('/users/:Name/Movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {       
  Users.findOneAndUpdate({ Name: req.params.Name }, {
     $pull: { FavoriteMovies: req.params.MovieID }
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


/**
  * Update a user's info, by name
  * @method updateUserInfo
  * @return response status
  */
app.put('/users/:Name', passport.authenticate('jwt', { session: false }),                                     
  [
    check('Name', 'Name is required').isLength({min: 5}),
    check('Name', 'Name contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({ Name: req.params.Name }, { $set:
    {
      Name: req.body.Name,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // confirms the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).json('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


/**
  * Add a movie to a user's list of favorites
  * @method addFavoriteMovie
  * @param {String} Name - name of movie
  * @param {String} MovieID - id from movie 
  * @return response status
  */
app.patch('/users/:Name/Movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Name: req.params.Name }, {
     $addToSet: { FavoriteMovies: req.params.MovieID }
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

/*
defining all /movies endpoints 
*/

/**
  * loads all movies from movieAPI
  * @method getAllMovies
  * @return {Object|Array} data from movieAPI
  */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then(function (movies) {
      res.status(201).json(movies);
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});


/**
  * get the data about a movie, by title 
  * @method getMovieByTitle
  * @return {Object} data from movieAPI
  */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title})
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) =>{
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


/**
  * get the data about the director of a movie, by name 
  * @method getDirectorByName
  * @return {Object} data from movieAPI
  */
app.get('/movies/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name})
    .then((director) => {
      res.json(director.Director);
    })
    .catch((err) =>{
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
  * get the data about the genre of a movie, by name
  * @method getGenrerByName
  * @return {Object} data from movieAPI
  */
app.get('/movies/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name})
    .then((genre) => {
      res.json(genre.Genre);
    })
    .catch((err) =>{
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
  * add a movie to the list of movies
  * @method addMovie
  * @param {String} Title - title of movie
  * @param {String} Description - description of movie
  * @return response status
  */
app.post('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
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


/**
  * delete a movie by title
  * @method deleteMovieByTitle
  * @param {String} Title - title of movie
  * @return response status
  */
app.delete('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
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


/**
  * listen for requests, define port
  * @method listenForRequest
  * @return console.log(port)
  */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
