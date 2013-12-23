#!/usr/bin/env node

var users = [
  {id:0, username: 'carlos', password:'password'}
];

var passport = require("passport"), express=require("express"),LocalStrategy = require('passport-local').Strategy;
var app = express();

passport.serializeUser(function(user, done) {
  done(null, user.id+"");
});

passport.deserializeUser(function(id, done) {
  done(null, users[id]);
});

passport.use(new LocalStrategy(function(username, password,done){
	//console.log("authenticating "+username+" " +password);
        for(u in users){
         if(users[u].username == username ){
          if (password== users[u].password) return done(null, users[u]);
          done(null, false, { message: 'Incorrect password.' });
	 }
	}
        return done(null, false, { message: 'Incorrect username.' });
}));

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'SECRET' }));
app.use(passport.initialize());

app.get('/', function(req, res) {
   res.sendfile('./index.html');
});

app.get('/login', function(req, res) {
   res.sendfile('./login.html');
});

app.get('/logout',  function(req, res){
   if (req.session) {
    req.session.auth = null;
    res.clearCookie('auth');
    req.session.destroy(function() {});
  }
  res.header('Cache-Control', 'no-cache');
  res.header('Expires', 'Fri, 31 Dec 1998 12:00:00 GMT');
  res.redirect('/login');
});

app.get('/public',  function(req, res){
   res.sendfile('./public.html');
});

app.get(/^\/./, function(req, res) {
  //if(req.isAuthenticated()) {
  if(req.session.passport.user) {
   console.log('user logged in', req.user);
   res.sendfile("./"+req.url);
  }else {
   console.log('user not logged in '+JSON.stringify(req.session.passport));
   res.sendfile('./login.html');
  }
});


app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));
app.use(passport.session());

app.listen(3000);
