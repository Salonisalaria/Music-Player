var express = require('express')
var path = require('path');
var app = express();
var ejs = require('ejs');
var fs = require('fs');
var session = require('express-session');
var nodemailer = require('nodemailer');
var multer = require('multer');
var ObjectId = require('mongodb').ObjectID;

app.set('views', path.join(__dirname));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname)));

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(session({secret: "xYzUCAchitkara"}));

// Connect with db
var mongoose = require('mongoose')
var mongoDb = 'mongodb://localhost/myDB'

var transporter = nodemailer.createTransport({
  	service: 'gmail',
  	auth:{
    	user: 'vikrantkumar158@gmail.com',
    	pass: 'windowsvista8986761191$'
  	}
});

mongoose.connect(mongoDb, function (error) {
	if(error) {
		throw error;
	}
	console.log("Db opened Successfully");
});

var upload=multer({limits:{fileSize: 2000000},dest:'./uploads/'});

var Schema = mongoose.Schema;

var userSchema = Schema({
	name: String,
	email: String,
	password: String,
	city: String,
	phoneno: String, 
	gender: String,
	dob: String,
	role: String,
	status: String,
	activity: String,
	PI1: String,
	PI2: String,
	PI3: String,
	delob: String,
    picId: String
});

var tagSchema = Schema({
	tagName: String,
	createdBy: String,
	createDate: String
});

var communitySchema = Schema({
	name: String,
	membershipRule: String,
	location: String,
	owner: String,
	createDate: String,
	activity: String,
	description: String
});

var imgSchema = new Schema({
    userid: String,
    data: Buffer, 
    contentType: String 
}); 

var userDetails = mongoose.model("userdetails", userSchema);

var tagDetails = mongoose.model("tagdetails",tagSchema);

var communityDetails = mongoose.model("communitydetails",communitySchema);

var upload=multer({limits:{fileSize: 2000000 },dest:'./uploads/'});

var imgDetails = mongoose.model("imagedetails", imgSchema);

app.get('/',function(req,res){
	if(req.session.isLogin)
	{
		if(req.session.isLogin==1)
			res.redirect('/admin/profile');
		else if(req.session.isLogin==5&&req.session.role=='Admin')
			res.redirect('/admin/profile');
		else
			res.redirect('/community/communitypanel');
	}
	else
	{
		res.sendFile(__dirname+'/Login.html');
	}
});

app.get('/logout',function(req,res){
	req.session.isLogin=0;
	req.session.userName="";
	req.session.password="";
	req.session.role="";
	res.send("Logged Out Successfully");
});

app.use('/admin' , require('./Admin/admin.js'));

app.use('/community' , require('./Communit/community'));

app.get('/profile',function(req,res){
	if(req.session.isLogin)
	{
		if(req.session.isLogin==2)
		{
			userDetails.find({
				email: req.session.userName
			}).exec(function(err,updata)
			{
				console.log(updata);
				if(err)
				{
					consle.log(2);
					throw err;
				}
				else
				{
					res.render(__dirname+'/uadminProfile',{pId:req.session.picId,name:req.session.name,data : updata});
				}
			});
		}
		else if(req.session.isLogin==3||req.session.isLogin==4)
		{
			userDetails.find({
				email: req.session.userName
			}).exec(function(err,updata)
			{
				console.log(updata);
				if(err)
				{
					consle.log(3);
					throw err;
				}
				else
				{
					res.render(__dirname+'/ucProfile',{pId:req.session.picId,name:req.session.name,data : updata});
				}
			});
		}
		else if(req.session.isLogin==1)
			res.redirect('/admin/profile');
	}
	else
	{
		res.redirect('/');
	}
});

app.get('/getPic/:id', (req, res) => {
    var filename = req.params.id;
    imgDetails.findOne({'_id': ObjectId(filename)}, (err, result) => {
        if (err) return console.log(err)
        res.contentType('image/jpeg');
        console.log(result);
        res.send(result.data);
    });
});

app.get('/editProfile',function(req,res){
	if(req.session.isLogin)
	{
		if(req.session.isLogin==2)
		{
			userDetails.find({
				email: req.session.userName
			}).exec(function(err,updata)
			{
				console.log(updata);
				if(err)
				{
					consle.log(3);
					throw err;
				}
				else
				{
					res.render(__dirname+'/uadminEdit',{pId:req.session.picId,name:req.session.name,data : updata});
				}
			});
		}
		if(req.session.isLogin==3||req.session.isLogin==4)
		{
			userDetails.find({
				email: req.session.userName
			}).exec(function(err,updata)
			{
				console.log(updata);
				if(err)
				{
					consle.log(3);
					throw err;
				}
				else
				{
					res.render(__dirname+'/ucEdit',{pId:req.session.picId,name:req.session.name,data : updata});
				}
			});
		}
	}
	else
	{
		res.redirect('/');
	}
});

app.get('/community/communitypanel',function(req,res){
	if(req.session.isLogin)
	{
		communityDetails.find({}).exec(function(err,data){
		if(err)
		{
			console.log(err);
			throw err;
		}
		console.log(data);
		if(req.session.isLogin==6)
			res.redirect('/editInformation');
		if(req.session.isLogin==5)
			res.sendFile(__dirname+'/broken.html');
		if(req.session.isLogin==2)
			res.render(__dirname+'/uadminCommList',{pId:req.session.picId,name:req.session.name,community : data});
		else if(req.session.isLogin==3)
			res.render(__dirname+'/userCommList',{pId:req.session.picId,name:req.session.name,community : data});
		else if(req.session.isLogin==4)
			res.render(__dirname+'/commCommList',{pId:req.session.picId,name:req.session.name,community : data});
		else if(req.session.isLogin==1)
			res.redirect('/community/communityList');
		});
	}
	else
	{
		res.redirect('/');
	}
});

app.get('/community/communityList',function(req,res){
	if(req.session.isLogin)
	{
		communityDetails.find({}).exec(function(err,data){
			if(err)
			{
				console.log(err);
				throw err;
			}
			console.log(data);
			if(req.session.isLogin==1&&req.session.role=='Superadmin')
				res.render(__dirname+'/sadminCommList',{pId:req.session.picId,name:req.session.name,community : data});
			else if(req.session.isLogin==1&&req.session.role=='Admin')
				res.render(__dirname+'/adminCommList',{pId:req.session.picId,name:req.session.name,community : data});
			else
				res.redirect('/');	
		});
	}
	else
	{
		res.redirect('/');
	}
});

app.get('/community/AddCommunity',function(req,res){
	if(req.session.isLogin==2)
	{
		res.render(__dirname+'/uadminAddComm',{pId:req.session.picId,name:req.session.name});
	}
	else
	{
		res.redirect('/');
	}
});

app.get('/editInformation',function(req,res){
	if(req.session.isLogin==6)
	{
		userDetails.find({
			email: req.session.userName
		}).exec(function(err,updata)
		{
			console.log(updata);
			if(err)
			{
				consle.log(3);
				throw err;
			}
			else
			{
				res.render(__dirname+'/editInfo',{pId:req.session.picId,name:req.session.name,data : updata});
			}
		});
	}
	else
	{
		res.redirect('/');
	}
});

app.get('/tag/tagslist',function(req,res){
	if(req.session.isLogin)
	{
		tagDetails.find({}).exec(function(err,data){
			if(err)
			{
				console.log(err);
				throw err;
			}
			console.log(data);
			if(req.session.isLogin==1&&req.session.role=='Superadmin')
				res.render(__dirname+'/tagList',{pId:req.session.picId,name:req.session.name,tag : data});
			else
				res.redirect('/');
		});
	}
	else
	{
		res.redirect('/');
	}
});

app.get(['/404.png','/community/404.png'],function(req,res){
	res.sendFile(__dirname+'/404.png');
});

app.get(['/defaultCommunity.jpg','/community/defaultCommunity.jpg'],function(req,res){
	res.sendFile(__dirname+'/defaultCommunity.jpg');
});

app.get('/login.js',function(req,res){
	res.sendFile(__dirname+'/login.js');
});

app.get(['/DataTables.css','/tag/DataTables.css','/community/DataTables.css'],function(req,res){
	res.sendFile(__dirname+'/DataTables.css');
});

app.get('/home/vikrant/node_modules/trumbowyg/dist/ui/trumbowyg.min.css',function(req,res){
	res.sendFile('/home/vikrant/node_modules/trumbowyg/dist/ui/trumbowyg.min.css');
});

app.get('/home/vikrant/node_modules/trumbowyg/dist/trumbowyg.min.js',function(req,res){
	res.sendFile('/home/vikrant/node_modules/trumbowyg/dist/trumbowyg.min.js');
});

app.get('/home/vikrant/node_modules/trumbowyg/dist/ui/icons.svg',function(req,res){
	res.sendFile('/home/vikrant/node_modules/trumbowyg/dist/ui/icons.svg');
});

app.get(['/sort_asc.png','/tag/sort_asc.png','/community/sort_asc.png'],function(req,res){
	res.sendFile(__dirname+'/sort_asc.png');
});

app.get(['/sort_asc_disabled.png','/tag/sort_asc_disabled.png','/community/sort_asc_disabled.png'],function(req,res){
	res.sendFile(__dirname+'/sort_asc_disabled.png');
});

app.get(['/sort_both.png','/tag/sort_both.png','/community/sort_both.png'],function(req,res){
	res.sendFile(__dirname+'/sort_both.png');
});

app.get(['/sort_desc.png','/tag/sort_desc.png','/community/sort_desc.png'],function(req,res){
	res.sendFile(__dirname+'/sort_desc.png');
});

app.get(['/sort_desc_disabled.png','/tag/sort_desc_disabled.png','/community/sort_desc_disabled.png'],function(req,res){
	res.sendFile(__dirname+'/sort_desc_disabled.png');
});

app.get('/tag',function(req,res){
	if(req.session.isLogin==1)
	{
		res.render(__dirname+'/tag',{pId:req.session.picId,name:req.session.name});
	}
	else
	{
		res.redirect('/');
	}
});

app.get('/changePassword',function(req,res){
	if(req.session.isLogin)
	{
		if(req.session.isLogin==1&&req.session.role=='Superadmin')
			res.render(__dirname+'/sadminChangePass',{pId:req.session.picId,name:req.session.name});
		else if(req.session.isLogin==1&&req.session.role=='Admin')
			res.render(__dirname+'/adminChangePass',{pId:req.session.picId,name:req.session.name});
		else if(req.session.isLogin==2)
			res.render(__dirname+'/uadminChangePass',{pId:req.session.picId,name:req.session.name});
		else if(req.session.isLogin==3||req.session.isLogin==4)
			res.render(__dirname+'/userChangePass',{pId:req.session.picId,name:req.session.name});
		else
			res.redirect('/');
	}
	else
	{
		res.redirect('/');
	}
});

app.get('/getUsers',function(req,res){
	userDetails.find({}).exec(function(err,data){
		if(err)
			throw err;
		res.send(data);
	});
});

app.put('/changePass',function(req,res)
{
	if(req.body.oldPassword==req.session.password)
	{
		userDetails.updateOne({email: req.session.userName},
		{
			password: req.body.newPassword
		}).exec(function(err,data){
			if(err)
			{
				console.log(err);
				throw err;
			}
			console.log(data);
			req.session.isLogin=0;
			res.send(data);
		});
	}
	else
		res.send("[]");
});

app.put('/deleteUser',function(req,res)
{
		userDetails.updateOne({email: req.session.userName},
		{
			delob: "1"
		}).exec(function(err,data){
			if(err)
			{
				console.log(err);
				throw err;
			}
			console.log(data);
			req.session.isLogin=0;
			res.send(data);
		});
});

app.put('/activation',function(req,res)
{
	if(req.body.email==req.session.userName&&req.body.activity=='Inactive')
		req.session.isLogin=0;
	
	userDetails.updateOne({email: req.body.email},
	{
		activity: req.body.activity
	}).exec(function(err,data){
		if(err)
			throw err;
		console.log(data);
		res.send(data);
	});
});

app.put(['/updateCommunity','/community/updateCommunity'],function(req,res)
{
	if(req.body.oldName==req.body.newName)
	{
		communityDetails.updateOne({name: req.body.newName},
		{
			activity: req.body.activity
		}).exec(function(err,data){
			if(err)
				throw err;
			console.log(data);
			res.send(data);
		});
	}
	else
	{
		communityDetails.find({name: req.body.newName}).exec(function(err,data)
		{
			if(data.length==0)
			{
				communityDetails.updateOne({name: req.body.oldName},
				{
					name: req.body.newName,
					activity: req.body.activity
				}).exec(function(err,udata){
					if(err)
					{
						console.log(err);
						throw err;
					}
					console.log(udata)
					res.send(udata);
				});
			}
			else
			{
				res.send("[]");
			}
		});	
	}
});

app.put('/updateUser',function(req,res)
{
	if(req.body.email==req.body.oldUser)
	{
		userDetails.updateOne({email: req.body.email},
		{
			phoneno: req.body.phone,
			city: req.body.city,
			role: req.body.role,
			status: req.body.status
		}).exec(function(err,data){
			if(err)
			{
				console.log(err);
				throw err;
			}
			console.log(data)
			res.send(data);
		});
	}
	else
	{
		userDetails.find({
			email: req.body.email
		}).exec(function(err,data){
			if(data.length==0)
			{
				if(req.body.oldUser==req.session.userName)
					req.session.isLogin=0;
				userDetails.updateOne({email: req.body.oldUser},
				{
					email: req.body.email,
					phoneno: req.body.phone,
					city: req.body.city,
					role: req.body.role,
					status: req.body.status
				}).exec(function(err,udata){
					if(err)
					{
						console.log(err);
						throw err;
					}
					console.log(udata)
					res.send(udata);
				});
			}
			else
			{
				res.send("[]");
			}
		});
	}
});

app.put('/updateByUser',function(req,res)
{
	if(req.session.isLogin==6)
	{
		if(req.session.role=='Admin'||req.session.role=='Superadmin')
			req.session.isLogin=1;
		else if(req.session.role=='User')
			req.session.isLogin=3;
		else if(req.session.role=='Community Builder')
			req.session.isLogin=4;
	}
	userDetails.updateOne({email: req.body.email},
	{
		name: req.body.name,
		city: req.body.city,
		phoneno: req.body.phoneno, 
		gender: req.body.gender,
		dob: req.body.dob,
		status: "Confirmed",
		PI1: req.body.PI1,
		PI2: req.body.PI2,
		PI3: req.body.PI3,
		delob: "0"
	}).exec(function(err,udata){
		if(err)
		{
			console.log(err);
			throw err;
		}
		console.log(udata);
		res.send(udata);
	});
});

app.post('/addUsers',function(req,res)
{
	var newUserDetails=new userDetails({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		city: req.body.city,
		phoneno: req.body.phoneno, 
		gender: req.body.gender,
		dob: req.body.dob,
		role: req.body.role,
		status: "Pending0",
		activity: "Active",
		PI1: "",
		PI2: "",
		PI3: "",
		delob: "-1",
        picId: "5cf0604a1d88cc0fbc06dd71"
	});
	userDetails.find({
        email: req.body.email,
    }).exec(function(err,data){
		if(err)
		{
			console.log(err);
			throw err;
		}
		console.log(data);
		if(data.length==0)
		{
			newUserDetails.save()
			.then(savedData => {
				console.log(savedData);
				res.send(data);
			})
			.catch(err => {
				console.log(err);
				res.status(400).send(error);
			});
			var mailOptions={
			 	from: 'vikrantkumar158@gmail.com',
			  	to: req.body.email,
			  	subject: 'Invitation to CQ',
			  	text: 'You are invited to join our new platform CQ. Username: '+req.body.email+' Password: '+req.body.password
			};

			transporter.sendMail(mailOptions, function(error, info){
				if (error){
					console.log(error);
				}
				else {
					console.log('Email sent: '+info.response);
			  	}
			});
		}
		else
		{
			res.send(data);
		}
    });
});

app.post('/users',function(req,res){
	console.log(req.body);
	var tCount,fCount;
	var size=parseInt(req.body.length);
	var start=parseInt(req.body.start);
	var serby=req.body.columns[parseInt(req.body.order[0].column)].name.toString();
	var ser=req.body.search.value;
	var sRole=req.body.role;
	var sStatus=req.body.status;
	if(req.session.isLogin)
	{
		userDetails.count({}).exec(function(err,totalCount)
		{
			if(err)
				throw err;
			tCount=totalCount;
		});
		var fin={email :new RegExp('^'+ser+'.*$', "i"),role : new RegExp('^'+sRole+'.*$', "i"),status : new RegExp('^'+sStatus+'.*$', "i")};
		userDetails.count(fin).exec(function(err,totalCount)
		{
			if(err)
				throw err;
			fCount=totalCount;
		});
		if(serby=='email')
		{	
			var fin={email :new RegExp('^'+ser+'.*$', "i"),role : new RegExp('^'+sRole+'.*$', "i"),status : new RegExp('^'+sStatus+'.*$', "i")};
			var obj={'email':req.body.order[0].dir};
		}
		else if(serby=='phoneno')
		{	
			var fin={email :new RegExp('^'+ser+'.*$', "i"),role : new RegExp('^'+sRole+'.*$', "i"),status : new RegExp('^'+sStatus+'.*$', "i")};
			var obj={'phoneno':req.body.order[0].dir};
		}
		else if(serby=='city')
		{	
			var fin={email :new RegExp('^'+ser+'.*$', "i"),role : new RegExp('^'+sRole+'.*$', "i"),status : new RegExp('^'+sStatus+'.*$', "i")};
			var obj={'city':req.body.order[0].dir};
		}
		else if(serby=='status')
		{	
			var fin={email :new RegExp('^'+ser+'.*$', "i"),role : new RegExp('^'+sRole+'.*$', "i"),status : new RegExp('^'+sStatus+'.*$', "i")};
			var obj={'status':req.body.order[0].dir};
		}
		else
		{	
			var fin={email :new RegExp('^'+ser+'.*$', "i"),role : new RegExp('^'+sRole+'.*$', "i"),status : new RegExp('^'+sStatus+'.*$', "i")};
			var obj={'role':req.body.order[0].dir};
		}
		userDetails.find(fin).skip(start).sort(obj).limit(size).exec(function(err,data){
			if(err)
			{
				console.log(err);
				throw err;
			}
			console.log("1");
			console.log(data);
			var totalPages=Math.ceil(fCount/size);
			res.send({pageLength:size,recordsTotal:tCount,recordsFiltered:fCount,data: data});
		});
	}
	else
	{
		res.redirect('/');
	}
});


app.post('/sendMail',function(req,res){
	var mailOptions={
		from: 'vikrantkumar158@gmail.com',
		to: req.body.id,
		subject: req.body.subject,
		text: req.body.text
	};
	transporter.sendMail(mailOptions, function(error, info){
		if (error){
			console.log(error);
			throw error;
		}
		else {
			console.log('Email sent: '+info.response);
		}
	});
	res.send("success");
});

app.post('/addTag',function(req,res)
{
	var newTagDetails=new tagDetails({
		tagName: req.body.tagName,
		createdBy: req.session.role,
		createDate: req.body.createDate
	});
	tagDetails.find({
		tagName: req.body.tagName
	}).exec(function(err,data){
		if(err)
			throw err;
		console.log(data);
		if(data.length==0)
		{
			newTagDetails.save()
			.then(savedData => {
				console.log(savedData);
				res.send(data);
			})
			.catch(err => {
				console.log(err);
				res.status(400).send(error);
			});
		}
		else
		{
			res.send(data);
		}
	});
});

app.post(['/addComm','/community/addComm'],function(req,res)
{
	var newCommunityDetails=new communityDetails({
		name: req.body.name,
		membershipRule: req.body.membershipRule,
		location: "Not Added",
		owner: req.session.name,
		createDate: req.body.createDate,
		activity: "Active",
		description: req.body.description
	});
	communityDetails.find({
		name: req.body.name
	}).exec(function(err,data){
		if(err)
			throw err;
		console.log(data);
		if(data.length==0)
		{
			newCommunityDetails.save()
			.then(savedData => {
				console.log(savedData);
				res.send(data);
			})
			.catch(err => {
				console.log(err);
				res.status(400).send(error);
			});
		}
		else
		{
			res.send(data);
		}
	});
});

app.post('/login',function(req,res){
    console.log(req.body);
    userDetails.find({
        email: req.body.userName,
        password: req.body.passWord
    }).exec(function(err,data){
		if(err)
		{
			console.log(err);
			throw err;
		}
		console.log(data);
		if(data.length==0)
			res.send(data);
		else
		{
			if(data[0].delob=='1' && data[0].role!='Superadmin')
				req.session.isLogin=0;
			else if(data[0].activity=='Inactive')
				req.session.isLogin=5;
			else if(data[0].delob=='-1')
				req.session.isLogin=6;
			else if(data[0].role=='Admin'||data[0].role=='Superadmin')
				req.session.isLogin=1;
			else if(data[0].role=='User')
				req.session.isLogin=3;
			else if(data[0].role=='Community Builder')
				req.session.isLogin=4;
			console.log(req.session.isLogin);
			req.session.userName=req.body.userName;
			req.session.password=req.body.passWord;
			req.session.name=data[0].name;
			req.session.role=data[0].role;
            req.session.picId=data[0].picId;
			console.log(req.session.role);
			res.send(data);
		}
    });
});

app.post('/uploadUserImg',upload.single('pic'),function(req,res){ 
    var newImg = fs.readFileSync(req.file.path);
    var encImg = newImg.toString('base64');
    var newImgDetails = new imgDetails({
        userid: req.session.userName,
        data: Buffer(encImg, 'base64'),
        contentType: req.file.mimetype
    });
    newImgDetails.save(function(err,data){
        if(err)
        {
            console.log(err);
            throw err;
        }
        console.log(data);
        req.session.picId=data._id;
        userDetails.updateOne({email: req.session.userName},
        {$set: {
            picId: data._id
        }}).exec(function(err,udata){
            if(err)
            {
                console.log(err);
                throw err;
            }
            console.log(udata);
        });
    });
    res.redirect('/editProfile');
});

app.delete('/deleteTag',function(req,res){
	tagDetails.remove({tagName: req.body.tagName}).exec(function(err,data){
		console.log(data);
		if(err)
			throw err;
		res.send(data);
	});
});

app.listen(8000);