// 登录和注册。
var express = require("express");
var app = express();

var db=require('./model/db.js');
const md5 = require('md5');
// ejs
const ejs=require('ejs');
app.set('view engine','ejs');
// post
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(`/public`,express.static('./public/'));
// session
var session = require('express-session')
// 持久化
var NedbStore = require('nedb-session-store')( session );
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie:{
  	maxAge:20000000
  },
  // 配置持久化
  store: new NedbStore({
      filename: 'path_to_nedb_persistence_file.db'
    })
}))
// 转化id格式
const ObjectId = require('mongodb').ObjectId;


// 页面开始的时候加载微博数据
app.get('/',(req,res)=>{
	if(req.session.login){
		db.find('ltblog','blog',{},res,function(res2){
			//res2是db.js的回调函数传输过来的res1,即查询的结果。
			db.find('ltblog','comment',{},res,function(res3){
				res.render('index',{show:false,user:req.session.user,login:true,message:res2,mesCom:res3});
			});
		});
	}else{
		db.find('ltblog','blog',{},res,function(res2){
			//res2是db.js的回调函数传输过来的res1,即查询的结果。
			db.find('ltblog','comment',{},res,function(res3){
				res.render('index',{show:true,user:'',login:false,message:res2,mesCom:res3});
			});			
		});
	}
});


// 点赞
app.post(`/goodNum`,urlencodedParser,(req,res)=>{
	var likes = req.body.liker;
	var id=ObjectId(req.body.id);
	db.find('ltblog','blog',{_id:id},res,function(res2){
		//res2是db.js的回调函数传输过来的res1,即查询的结果。
		// console.log(111)
		// console.log(res2)
		if(res2[0].agree.indexOf(likes)==-1){
			// console.log(222)
			res2[0].agree.push(likes);
			db.updatemany('ltblog','blog',{_id:id},{$set: {agree:res2[0].agree}},res,function(){
				// console.log('update');
				// console.log(res2[0].agree.length)
				res.send({"status":"点赞成功！","goodNum":(res2[0].agree.length)});
			});
		}else{
			// console.log(333)
			var num = res2[0].agree.indexOf(likes);
			// console.log(num);
			res2[0].agree.splice(num,1);
			// console.log(res2[0].agree);
			db.updatemany('ltblog','blog',{_id:id},{$set: {agree:res2[0].agree}},res,function(){
				// console.log('delUpdate');
				// console.log(res2[0].agree.length)
				res.send({"status":"取消点赞成功！","goodNum":(res2[0].agree.length)});
			});
		}
	});
	
});


app.get(`/login`,(req,res)=>{
	res.render('login');
});
app.get(`/register`,(req,res)=>{
	res.render('register');
});
app.get('/quit',(req,res)=>{
	req.session.user=null;
	req.session.login=false;
	res.redirect('http://localhost:8989/')
});
// 登录
app.post(`/logon`,urlencodedParser,(req,res)=>{
	var name=req.body.username;
	var pass=req.body.password;

	db.find('ltblog','user',{username:name},res,(res1)=>{
		if(res1.length==0){
			res.send({"status":"用户名不存在!"});
		}else{
			db.find('ltblog','user',{username:name,password:pass},res,function(res2){
				//res2是db.js的回调函数传输过来的res1,即查询的结果。
				if(res2.length==0){
					res.send({"status":"密码匹对不成功！"});
				}else{
					req.session.user=name;
					req.session.login=true;
					res.send({"status":"密码匹对成功！"});
				}
			})
		}
	})
})
// 注册
app.post(`/register`,urlencodedParser,(req,res)=>{
	var name=req.body.username;
	var pass=req.body.password;

	db.find('ltblog','user',{username:name},res,(res1)=>{
		if(res1.length==0){
			//判断是失去焦点的判断还是点击注册后的判断（后者有传密码）
			if(pass){
				db.insert('ltblog','user',{username:name,password:pass},res,function(){
					res.send({"status":"数据插入成功！"});
				})
			}else{
				res.send({"status":"ok"});
			}
		}else{
			res.send({"status":"用户名已经存在!"});
		}
	})
});


// 保存发表的微博。
app.post(`/save`,urlencodedParser,(req,res)=>{
	var name=req.body.loginUser;
	var con=req.body.content;
	var date = new Date();
	var str = date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日'+date.getHours()+'时'+date.getMinutes()+'分'+date.getSeconds()+'秒';

	db.insert('ltblog','blog',{loginName:name,content:con,date:str,agree:[]},res,function(res1){
		// console.log(res1.ops[0]._id)
		res.send({"status":"数据插入成功！",date:str,id:res1.ops[0]._id});
	})
});


//删除微博 
app.post(`/deleteBlog`,urlencodedParser,(req,res)=>{
	var id=ObjectId(req.body.id);
	db.deletemany('ltblog','blog',{_id:id},res,function(res1){
		//res1为删除成功后返回的删除信息。
		res.send(res1);
	});
});


// 保存评论
app.post(`/comment`,urlencodedParser,(req,res)=>{
	var blogId = req.body.id;
	var user = req.body.user;
	var com = [];
	com.push(req.body.com); 
	console.log(blogId);
	console.log(user);
	console.log(com);

	var date = new Date();
	var str = date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日'+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

	db.insert('ltblog','comment',{loginName:user,id:blogId,date:str,com:com},res,function(res1){
		// console.log(res1.ops[0]._id)
		res.send({"status":"评论成功！",date:str,com:com});
	})
});


app.listen(8989,()=>{
	console.log("success");
})