var express = require('express');
var router = express.Router();
var fs = require('fs');
var mysql = require('mysql');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var ejs = require('ejs');
var random = require('randomize');
var app = express();
var client;



// 데이터베이스 연결
client = mysql.createConnection({
	user: 'project',
	password: 'pwproject',
	database: 'voluntalk'
});

/* GET home page. */
router.get('/', function(req, res, next) {
	client.query('select * from tbl_hash', function(err, results){
		
		if(results){
			res.render('index', {
				data: results,
				user_id : req.session.user_id,
				name: req.session.name
			});
		}
		else{
			res.render('index', {
				user_id : req.session.user_id,
				name: req.session.name
			});
		}
	});
});

module.exports = router;
