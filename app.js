/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var HerokuStrategy = require('passport-heroku').Strategy;


//HEROKU CREDENTIALS
var HEROKU_CLIENT_ID = "82b2d916-79f2-414e-807d-5dd9ea581577";
var HEROKU_CLIENT_SECRET = "81751020-3e93-4823-bf1a-eae08be6ee14";

//GITHUB CREDENTIALS
var GITHUB_CLIENT_ID = "e3519e7ab3d1b8c8de06";
var GITHUB_CLIENT_SECRET = "dfb27c31d1752c7c0b75ed50bfcec8b37919d3c8";

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

passport.use(new HerokuStrategy({
        clientID: HEROKU_CLIENT_ID,
        clientSecret: HEROKU_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/heroku/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ githubId: profile.id }, function(err, user) {
            return done(err, user);
        });
    }
));

//authenticate to heroku
app.get('/auth/heroku', passport.authenticate('heroku'));

//handle response
app.get('/auth/heroku/callback',
    passport.authenticate('heroku', {
        successRedirect: '/success',
        failureRedirect: '/error'
    }));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

app.get('/success', function(req, res) {
    res.send("success logged in");
});

app.get('/error', function(req, res) {
    res.send("error logged in");
});


app.get('/', function(req, res) {
    res.sendfile('./views/auth.html');
});

passport.use(new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            console.log(profile);
            return done(null, profile);
        });
    }
));

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback',
    passport.authenticate('github', {
        successRedirect: '/success',
        failureRedirect: '/error'
    }));

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});