var express = require('express');
var ejs = require('ejs');
var fs = require('fs');
var app = express();
var mysql  = require('mysql');

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
app.get('/stitch', function(req, res){
    res.render('stitch');
});
app.get('/success', function(req, res){
    res.render('success');
});

app.post('/model', function(req, res){
	var model = req.body.model;
	var name = req.body.name;
    fs.writeFile('./public/uploaded/'+name+'.stl',model,function(err){
        if(err) throw err;
        console.log('model save finished');
    });
	res.send('model ok',200);
});


app.post('/order', function(req, res){

	var uuid = req.body.uuid;
	var name = req.body.name;
	var phone = req.body.phone;
	var address = req.body.address;
	var connection = mysql.createConnection({     
	  host     : '127.0.0.1',
	  user     : 'root',
	  password     : 'root',
	  database     : '3DOnline',
	  port: '3306',
	});
	connection.connect(function(err){
		if(err){        
			  console.log('[query] - :'+err);
			return;
		}
		console.log('[connection connect]  succeed!');
	});
	var  addSql = 'INSERT INTO orders(uuid,name,phone,address) VALUES(?,?,?,?)';
	var  addSqlParams = [uuid, name, phone, address];
	connection.query(addSql,addSqlParams,function (err, result) {
			if(err){
				console.log('[INSERT ERROR] - ',err.message);
				return;
			}
			console.log('order save finished');
			res.send('order ok',200);
	});
	connection.end();
});

var http = require('http');
var server = http.createServer(app).listen(9000);
var BinaryServer = require('binaryjs').BinaryServer;
var binaryServer = new BinaryServer({server: server, path: '/binary-endpoint'});

binaryServer.on('connection', function(client){
	client.on('stream', function(stream, meta){
		var file = fs.createWriteStream('./public/test');
		stream.pipe(file);
		stream.on('data', function(data){
			console.log(data);
			stream.write(data);
		});
    });
});
