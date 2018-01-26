var express = require('express');
var router = express.Router();
var fs = require('fs');
var mysql = require('mysql');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var ejs = require('ejs');
var findHashtags = require('find-hashtags');
var app = express();
var client;


// 데이터베이스 연결
client = mysql.createConnection({
	user: 'project',
	password: 'pwproject',
	database: 'voluntalk'
  });



router.get('/list', function(req, res, next) {

	console.log('=====게시글 목록=====');
	console.log('board list에서의 session name : ' + req.session.name);
	console.log('board lsit에서의 session id : ' + req.session.user_id);

	var user_id = req.session.user_id;

	// 봉사활동 정보를 보여주되, 현재 날짜보다 마감 날짜가 이전인 것들은 보여지지 않도록 함 
	var select_all = 'select v.vol_id, date_format(v.end_date, "%y-%c-%e") end_date, a.agency_region, a.agency_name, v.vol_cat, v.vol_name, v.limitNum, v.applied from tbl_volun v, tbl_agency a where v.agency_id = a.agency_id and curdate() < v.end_date';
	var check_admin = 'select agency_id, isAdmin from tbl_user where user_id=?';
	
	client.query(select_all, function(err, results){
		if(err){
			console.log(err.message);
		}
		client.query(check_admin, [user_id], function(err, result_admin){
			res.render('boardList.ejs', {
				data: results,
				isAdmin: result_admin[0].isAdmin,
				name: req.session.name,
				user_id: req.session.user_id			
			});
		});
	});
});


router.get('/volunCreate/:user_id', function(req, res, next){

	var user_id = req.params['user_id'];

	console.log('=====봉사활동 생성=====');
	// var select_agency = 'select agency_id, user_id, agency_name from tbl_agency where user_id = ?';
	// client.query(select_agency, [user_id], function(err, result){
		res.render('volunCreate.ejs', {
			// agency_id: result[0].agency_id,
			// agency_name: result[0].agency_name,
			name: req.session.name,
			user_id: user_id
		});
	// });

});


router.post('/volunCreate/:user_id', function(req, res, next){
	var user_id = req.session.user_id;
	var item = {};
	var resultCode = "0";
	console.log('=====봉사활동 등록 중=====');

	var vol_name = req.body.volName;
	// var agency_id;
	// client.query('select agency_id from tbl_user where user_id=?', [user_id], function(err, result){
	// 	console.log(result[0].agency_id);
	// });

	// console.log(agency_id);

	var vol_intro = req.body.volIntro;
	var limitNum = req.body.volLimit;
	var vol_category = req.body.volCategory;

	var daterange = req.body.daterange;

	var arr = daterange.split("-");

	// var start_date = trim(arr[0]);
	var start_date = arr[0];
	var arr_s = arr[0].split("/");
	var start_date = arr_s[0];
	var start_month = arr_s[1];
	var start_year = arr_s[2];
	// var start_year = trim(arr_s[2]);


	// var end_date = trim(arr[1]);
	var end_date = arr[1];
	var arr_e = arr[1].split("/");
	var end_date = arr_e[0];
	var end_month = arr_e[1];
	var end_year = arr_e[2];
	// var end_year = trim(arr_e[2]);

	var start = arr_s[2].trim() + "/" + arr_s[0] + "/" + arr_s[1];
	var end = arr_e[2] + "/" + arr_e[0].trim() + "/" + arr_e[1];

	console.log(start, end);


	client.query('select agency_id from tbl_user where user_id=?', [user_id], function(err, userData){

	var agency_id = userData[0].agency_id;

	var vol_id;
	var insert_volun = 'insert into tbl_volun (vol_name, agency_id, vol_intro, limitNum, vol_cat, start_date, end_date) values (?, ?, ?, ?, ?, ?, ?)';
	var insert_hash = 'insert into tbl_hash (vol_id, hash1, hash2, hash3) values(?, ?, ?, ?)';
	client.query(insert_volun, [vol_name, agency_id, vol_intro, limitNum, vol_category, start, end], function(err, result){
		if(err){
			console.log(err.message);
		}
		var vol_id = result.insertId;
		var hashtag = req.body.hashtag;
		var hashContent = findHashtags(hashtag);
		client.query(insert_hash, [vol_id, hashContent[0], hashContent[1], hashContent[2]], function(data){
			resultCode = "1";
			item.code = resultCode;
			res.end(JSON.stringify(item));
		});
	});

	});

});



router.get('/volunPop/:volun_id/:user_id', function(req, res, next) {

		var volun_id = req.params['volun_id'];
		var user_id = req.params['user_id'];
	
		console.log('=====상세정보 팝업=====');
		fs.readFile('./views/volunPop.ejs', 'utf-8', function(err, data){
			  if(err){
				console.log(err.message);
				res.render('error.ejs');
			}
			// console.log('board list에서의 session name : ' + req.session.name);
			
			var select_all = 'select v.vol_id, v.vol_name, v.vol_intro, v.limitNum, v.vol_cat, date_format(v.start_date, "%y-%c-%e") start_date, date_format(v.end_date, "%y-%c-%e") end_date, a.agency_name, a.agency_region from tbl_volun v, tbl_agency a where v.agency_id = a.agency_id and v.vol_id=?';
			client.query(select_all, [volun_id], function(err, results){

				client.query('select * from tbl_hash where vol_id=?', [volun_id], function(err, hashdata){
					res.send(ejs.render(data, {
						hashdata: hashdata,
						data: results,
						name: req.session.name,
						user_id: req.session.user_id
					}));
				});
			});
			// res.writeHead(200, {'Content-Type' : 'text/html'});
			// res.end(data);
		  });


			// var select_all = 'select v.vol_id, v.vol_name, v.vol_intro, v.limitNum, v.vol_cat, date_format(v.start_date, "%y-%c-%e") start_date, date_format(v.end_date, "%y-%c-%e") end_date, a.agency_name, a.agency_region from tbl_volun v, tbl_agency a where v.agency_id = a.agency_id and v.vol_id=?';
		  	// client.query(select_all, [volun_id], function(err, results){
			// 	  if(err){
			// 		  console.log('찾는 데이터가 없습니다.');
			// 	  }
			// 	res.render('volunPop.ejs', {data:results, name:req.session.name, user_id:req.session.user_id});
			// });




	});

	router.get('/join/:volun_id/:user_id', function(req, res, next) {
		
				var volun_id = req.params['volun_id'];
				var user_id = req.session.user_id;

				var item = {};
				// 상태코드 (0:중복신청 , 1:내역없음, 2:신청인원 초과)
				var resultCode = "0";


				console.log('=====봉사 신청=====');

				// 신청인원 초과된 경우
				var selectLimit = 'select applied, limitNum from tbl_volun where vol_id = ?';
				client.query(selectLimit, [volun_id], function(err, result){
					if(result[0].applied >= result[0].limitNum){
						resultCode = "2";
						item.code = resultCode;
						res.end(JSON.stringify(item));
					}


					// 신청인원 초과되지 않은 경우
					else{

						var selectQuery = 'select vol_id from tbl_user where user_id = ?'
						// 해당 사용자의 봉사활동 여부 체크
						client.query(selectQuery, [user_id], function(err, result){
		
		
							// 해당 사용자의 봉사활동이 없으면, (-> 정상 등록)
							if(result[0].vol_id == 0 || result[0].vol_id == null){
								var update = 'update tbl_user set vol_id = ? where user_id = ?';
								client.query(update, [volun_id, user_id],function(err, results){
		
									var updateNum = 'update tbl_volun set applied = (select count(*) from tbl_user where vol_id=?) where vol_id=?';
									client.query(updateNum, [volun_id, volun_id]);
		
									resultCode = "1";
									item.code = resultCode;
									res.end(JSON.stringify(item));
								});
							}

							// 해당 사용자의 봉사활동이 있는 경우 (-> 등록 x)
							else{
								resultCode="0"
								item.code = resultCode;          
								res.end(JSON.stringify(item));
							}
						});

					}
				});
				



	});


	router.get('/mypage/:user_id', function(req, res, next){
		var user_id = req.params['user_id'];

		if(user_id == 'undefined'){
			res.render('error.ejs');
		}

		console.log('===== 마이페이지 =====')
		var selectQuery = 'select * from tbl_user where user_id=?';

		console.log('board list에서의 session name : ' + req.session.name);
		console.log('board lsit에서의 session id : ' + req.session.user_id);

		client.query(selectQuery, [user_id], function(err, results){
			var vol_id = results[0].vol_id;
			console.log(vol_id);
				res.render('mypage.ejs', {
					data:results,
					name: req.session.name,
					user_id: req.session.user_id,
				
				});

		});
	});


	router.get('/mypageEdit/:user_id', function(req, res, next){

		var user_id = req.params['user_id'];

		if(user_id == 'undefined'){
			res.render('error.ejs');
		}

		console.log(user_id);
		console.log('===== 마이페이지 수정 =====')
		var selectQuery = 'select * from tbl_user where user_id=?';

		client.query(selectQuery, [user_id], function(err, results){
			var vol_id = results[0].vol_id;
			res.render('mypageEdit.ejs', {
				user_id: req.session.user_id,
				data: results,
			});
		});
	});


	router.post('/mypageEdit/:user_id', function(req, res, next){
		var user_id = req.params['user_id'];

		if(user_id == 'undefined'){
			res.render('error.ejs');
		}

		var name = req.body.name;
		var location = req.body.location;
		var category = req.body.category;
		var intro = req.body.intro;
		var resultCode = "0";
		var item = {};

		console.log(user_id);
		console.log('===== 마이페이지 수정 후 저장 =====');

		req.session.name = name;

		var updateQuery = "update tbl_user set name=?, location=?, category=?, intro=? where user_id=?";

		res.render('mypage', function(){
			client.query(updateQuery, [name, location, category, intro, user_id], function(err, results){
				resultCode = "1";
				item.code = resultCode;
				res.end(JSON.stringify(item));			
			});
		});
	});
	
	router.post('/deleteVolun/:vol_id', function(req, res, next){
		user_id = req.session.user_id;
		var deleteQuery = 'update tbl_user set vol_id = null where user_id = ?';
		var resultCode = "0";
		var item = {};

		client.query(deleteQuery,[user_id], function(err, result){
			resultCode = "1";
			item.code = resultCode;
			res.end(JSON.stringify(item));					
		});

	});


	router.get('/volunComm/:vol_id', function(req, res, next){
		var vol_id = req.params['vol_id'];
		var user_id = req.session.user_id;
		// console.log(user_id, vol_id);
		var name = req.session.name;

		console.log('===== 봉사활동 그룹페이지 =====')

		// tbl_user와 tbl_volun 의 내용 담은 쿼리문
		var selectQuery = 'select * from tbl_volun, tbl_user where tbl_volun.vol_id = tbl_user.vol_id and tbl_user.vol_id=?';

		// tbl_board의 내용 담은 쿼리문
		var selectQuery2 = 'select * from tbl_board, tbl_user where tbl_board.user_id=tbl_user.user_id and tbl_board.vol_id=? order by isNotice desc, board_time';

		client.query(selectQuery, [vol_id], function(err, results){

			client.query(selectQuery2, [vol_id], function(err, results2){

				res.render('volunComm.ejs', {
					user_id: req.session.user_id,
					name: req.session.name,
					data: results,
					vol_id: vol_id,
					boardData: results2
				});
			});
		});
			
	});


	router.post('/write/:user_id/:vol_id', function(req, res, next){


		var user_id = req.params['user_id'];
		var vol_id = req.params['vol_id'];
		var name = req.session.name;
		var item = {};
		var resultCode = "0";
		
		if(user_id == 'undefined'){
			res.render('error.ejs');
		}
		
		var isNotice = req.body.isNotice;
		if(isNotice =='false'){
			isNotice = 0;
		}
		else{
			isNotice = 1;
		}

		var txt_content = req.body.txt_content;

		// console.log(isNotice + ":" +txt_content);

		var resultCode = "0";
		// var insertQuery = 'insert into tbl_board (board_content, isNotice, user_id, vol_id) values (?, ?, ?, ?)';
	
		client.query('INSERT INTO tbl_board(board_content, isNotice, user_id, vol_id) VALUES (?, ?, ?, ?)', [txt_content, isNotice, user_id, vol_id], function(err, rows){
			
			if(err){
				console.log(err.message);
			}
		// client.query(insertQuery, [txt_content, isNotice, user_id, vol_id], function(err, results){
			console.log(txt_content, isNotice, user_id, vol_id);
			resultCode = "1";
			item.code = resultCode;
			res.end(JSON.stringify(item));	
		});

	});


	router.post('/volunDelete/:vol_id', function(req, res, next){
		vol_id = req.params['vol_id'];
		var item = {};
		var resultCode = "0";

		client.query('delete from tbl_volun where vol_id= ?', [vol_id], function(err, result){
			resultCode = "1";
			item.code = resultCode;
			res.end(JSON.stringify(item));	
		});
	});


module.exports = router;
