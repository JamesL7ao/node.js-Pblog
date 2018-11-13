var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

function _connect(callback){
	MongoClient.connect(url,(err,db)=>{
		if(err) return;
		//用回调函数来返回db（连接数据库成功之后返回的文件）,下面回调函数相当于使用函数，把db传给所调用函数。
		//所以回调函数可以把某个参数返回出去，替代return的效果。
		callback(db);
	})
}

module.exports.insert=function(dbname,collection,obj,res,callback1){
	_connect(function(db1){
		
		if(obj instanceof Array){
			obj=obj;
		}else{
			obj=[obj];
		}
		
		//db1连接数据库成功之后返回的文件。
		db1.db(dbname).collection(collection).insertMany(obj,(err,res1)=>{
			//res1为插入成功后返回的插入信息。
			callback1(res1);
		})
	})
}


module.exports.find=function(dbname,collection,obj,res,callback1,mysort1,m1,n1){
	var l=arguments.length;
	_connect(function(db1){
//		var obj = {number:{$lt:3}};	//在find里面。
//		var x = {number:-1};
		var m=0;
		var n=0;
		var mysort={};
//		console.log(x.number);

		if(l==5){
			
		}else if(l==6){
			mysort=mysort1;
		}else if(l==7){
			mysort=mysort1;
			m=m1;
		}else if(l==8){
			mysort=mysort1;
			m=m1;
			n=n1;
		}
		
		//db1连接数据库成功之后返回的文件。
		db1.db(dbname).collection(collection).find(obj).sort(mysort).skip(m).limit(n).toArray(function(err,res1){
//			console.log(res1);
//			res.send(res1);
			//用回调函数来返回res1（查询的结果）,下面回调函数相当于使用函数，把res1传给所调用函数。
			//所以回调函数可以把某个参数返回出去，替代return的效果。
			callback1(res1);
		})
	})
}

module.exports.updateone=function(dbname,collection,whereStr,updateStr,res){
	_connect(function(db1){
	    db1.db(dbname).collection(collection).updateOne(whereStr, updateStr, function(err, res1) {
	        if (err) throw err;
	        // console.log("一条文档更新成功");
	        // db.close();
	        res.send("一条文档更新成功");
	    });
	})
};

module.exports.updatemany=function(dbname,collection,whereStr,updateStr,res,callback1){
	_connect(function(db1){
	    db1.db(dbname).collection(collection).updateMany(whereStr, updateStr, function(err, res1) {
	        if (err) throw err;
	         // console.log(res1.result.nModified + " 条文档被更新");
	         // res.send(res1.result.nModified + " 条文档被更新");
	        // db.close();
	        callback1(res1);
	    });
	})
};

module.exports.deleteone=function(dbname,collection,whereStr,res,callback1){
	_connect(function(db1){
	    db1.db(dbname).collection(collection).deleteOne(whereStr, function(err, obj) {
//	    	console.log(obj);
	        callback1(obj);
	    });
	})
};

module.exports.deletemany=function(dbname,collection,whereStr,res,callback1){
	_connect(function(db1){
	    db1.db(dbname).collection(collection).deleteMany(whereStr, function(err, obj) {
	    	console.log(obj);
	        callback1(obj);
	    });
	})
};