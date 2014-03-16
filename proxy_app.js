#!/usr/bin/env node

var users = [ {id:0, username: 'carlos', password:'password'} ];

var passport = require("passport"), express=require("express"),LocalStrategy = require('passport-local').Strategy,fs=require('fs'), jade = require('jade'), httpProxy=require('http-proxy'), bhost="localhost", bport=9001;
var rest = require('restler');
//var _=require('underscore');

//var proxy = new httpProxy.RoutingProxy();
var proxy = httpProxy.createProxyServer({target: { host: 'localhost', port: 9001 } });

var app = express();

passport.serializeUser(function(user, done) {
  done(null, user.id+"");
});

passport.deserializeUser(function(id, done) {
  done(null, users[id]);
});

passport.use(new LocalStrategy(function(username, password,done){
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



app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/login', function(req, res) { res.sendfile('./login.html'); });



app.all(/^\/.?/, function(req, res) {
  if(req.session.passport.user) {
   //console.log('user ', req.session.passport.user, " logged in");
   req.headers['iv-user']=req.session.passport.user;
   res.setHeader("iv-user",req.headers["iv-user"]);
   if(req.method=="PUT") { 
	//req.params=_.extend(req.params || {}, req.query || {}, req.body || {});
	rest.put('http://'+bhost+':'+bport+req.url, req).on('complete', function(data, response) { res.end(data); });
  }else  if(req.method=="POST") { 
	rest.post('http://localhost:9001'+req.url, req).on('complete', function(data, response) { res.end(data); });
  }else 
   	proxy.web(req, res);
  }else {
   req.session.attempting=req.url;
   console.log('user not logged in '+JSON.stringify(req.session.passport));
   res.sendfile('./login.html');
  }
});

app.use(passport.session());

app.listen(80);
