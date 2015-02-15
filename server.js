var express = require('express');
var ejs = require('ejs');
var fs = require('fs');
var app = express();

app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
    app.set('views', __dirname);
    app.engine('.html', ejs.__express);
    app.set('view engine', 'html');
});

app.get('/', function(req, res){
    res.render('index');
});
app.get('/info', function(req, res){
    res.render('info');
});
app.get('/minions', function(req, res){
    res.render('minions');
});
app.get('/success', function(req, res){
    res.render('success');
});
app.post('/model', function(req, res){
	var model = req.body.model;
	var name = req.body.name;
    fs.writeFile('./public/'+name+'.stl',model,function(err){
        if(err) throw err;
        console.log('has finished');
    });
	res.send('model ok',200);
});
app.listen(3000);
