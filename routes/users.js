var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var ejs = require('ejs');
var client;
var fs = require('fs');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var sess;

app.use(cookieParser());
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: true,
  cookie: {
      maxAge: 1000*50
  }
}));


// 데이터베이스 연결
client = mysql.createConnection({
  user: 'project',
  password: 'pwproject',
  database: 'voluntalk'
});
console.log('데이터베이스 연결');



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


// 회원가입
router.post('/signup', function(req, res){
  
    console.log('=====회원가입===== '+ (new Date()).toLocaleString());

    // parameter setting, 기본값(stdno: '0', nm/pw/intro: '')
    var email = req.body.email;
    var password = req.body.password;
    var name = req.body.name;
    var intro = req.body.intro;
    var resultCode = "0";
    var item= {};

    console.log('email[%s] password[%s] name[%s] intro[%s]', email, password, name, intro);

    // var result = {code:"1"}; //성공:1, 실패:0, 중복:2

    var select_query = 'SELECT * FROM tbl_user WHERE email=?';
    client.query(select_query, [email], function(err, rows){
        if(err) throw err;
  
        // 아이디가 없는 경우 --> 정보 등록 시작
        if(rows.length==0){
          client.query('INSERT INTO tbl_user(email, password, name, intro) VALUES (?, ?, ?, ?)', [email, password, name, intro], function(err, rows){
            // 응답코드 생성
            resultCode = "1";
            // 전달할 item 에 값 넣어주기
            item.email = email;
            item.name = name;
            item.code = resultCode;          
            res.end(JSON.stringify(item));
          });
        }
  
        // 아이디가 있는 경우 --> 아이디가 이미 존재
        else{
          resultCode = "0";
          item.code = resultCode;
          res.end(JSON.stringify(item));
        }
    });

    // // stdno 중복 check: midTermModule내 getItem 함수 사용    
    // var obj = myModule.getItem(items, "stdno", stdno);
    // if (myModule.isNotEmptyObj(obj)) {// midTermModule내 isNotEmptyObj 함수 사용 
    //     result.code = "2";
    // } else {
    //     // 입력된 데이터 items에 추가
    //     items.push({stdno: stdno, pw: pw, nm: nm, intro: intro, dt: new Date()});
    //     var curDate = (new Date()).toLocaleString();
    //     var item = obj// 입력된 객체 생성
    //     console.log('item==>%j', item);
    //     // 객체 추가
    //     result[2] = item;
    // } 
    
    // // 응답 데이터
    // res.send(result);
});




// 로그인
router.post('/login', function(req, res){
	console.log('=====로그인===== '+ (new Date()).toLocaleString());
  // parameter setting, 기본값(stdno: '0', pw: '')  
  var item= {};

  // // 1) 세션이 있다면
  // if(req.session.name){
  //   console.log('세션 있음 - 유지하겠음');
  //   item.email = req.session.email;
  //   item.name = req.session.name;
    
  //   // 응답코드 생성
  //   resultCode = "1";
  //   // 응답 데이터 세팅
  //   item.code = resultCode;
  //   console.log(req.session.email + ":" +req.session.name);
  //   res.end(JSON.stringify(item));
  // }

  // 2) 세션이 없다면
  var email = req.body.email;
  var password = req.body.password;
  console.log("stdno[%s] pw[%s]", email, password);

  
	var resultCode = "0";// 상태코드: 1(성공), 0(실패)
	var select_query = 'SELECT * FROM tbl_user WHERE email=?';
  client.query(select_query, [email], function(err, rows){
      if(err) throw err;

      // 아이디가 없는 경우
      if(rows.length==0){
        res.end(JSON.stringify(item));
      }

      // 아이디가 있는 경우
      else{
        console.log(rows[0].email+" | "+rows[0].password);
        if(password == rows[0].password){
            
            //세션 생성
            req.session.email = rows[0].email;
            req.session.name = rows[0].name;
            req.session.user_id = rows[0].user_id;
            console.log("세션 생성...");


            // 응답코드 생성
            resultCode = "1";

            // 전달할 item 에 값 넣어주기
            item.email = rows[0].email;
            item.name = rows[0].name;
            item.user_id = rows[0].user_id;
        }

        // 응답 데이터 세팅
        item.code = resultCode;
        res.end(JSON.stringify(item));
      }
	});
});


// 로그아웃
router.get('/logout', function(req, res, next) {
  console.log('=====로그아웃===== '+ (new Date()).toLocaleString());


  // 세션이 존재한다면 삭제
  if(req.session.name){
      // 세션 삭제
      req.session.destroy(function(err){
          if(err){
              res.send(err);
          }
      });
  }
  console.log('세션이 삭제되고 로그아웃됩니다.');

  // 메인화면으로 redirect
  // res.redirect('http://127.0.0.1:3000');
  res.redirect('http://127.0.0.1:3000');
});


module.exports = router;
