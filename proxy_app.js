var express = require('express');
var http = require('http');
var httpProxy = require('http-proxy');
var expressSession= require('express-session');
var qs = require('querystring');


var proxy = httpProxy.createProxyServer({target:'http://localhost:80'});
var app = express();
app.use(expressSession({ secret: 'SECRET' }));



//app.use(function(req, res, next) {
var auth=function(req,res,next){
  if (!req.session || !req.session.user_id) {
    res.redirect('/login');
    //res.send('You are not authorized to view this page');
  } else {
    next();
  }
}

app.get('/login', function(req, res) { res.sendfile('./login.html'); });
 
app.post('/login', function (req, res) {
        var body = '';
        req.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            if (body.length > 1e6)
                req.connection.destroy();
        });
        req.on('end', function () {
            var post = qs.parse(body);
  	    if (post.username === 'carlos' && post.password === 'password') {
		if(!req.session)req.session={};
            	req.session.user_id = post.username;
            	res.redirect('/form.html');
  	    } else {
    		//res.redirect('/login');
    		res.send('Bad user/pass');
  	    }
        });
});

app.get('/logout', auth,function (req, res) {
  delete req.session.user_id;
  res.redirect('/login');
}); 


//app.all(/^\/.?/,auth, function(req, res) {
app.all(/^\/.?/, auth,function(req, res) {
	proxy.web(req, res);
});


app.listen(process.env.PORT || 8001);
