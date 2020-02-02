var express = require('express')
var path = require('path');
var app = express();
var ejs = require('ejs');
var fs = require('fs');
var session = require('express-session');
var nodemailer = require('nodemailer');
var multer = require('multer');
var ObjectId = require('mongodb').ObjectID;
const router = express.Router();

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

router.get('/profile',function(req,res){
	if(req.session.isLogin)
	{
		if(req.session.isLogin==1)
		{
			userDetails.find({
				email: req.session.userName
			}).exec(function(err,updata)
			{
				console.log(updata);
				if(err)
				{
					consle.log(1);
					throw err;
				}
				else
				{
					if(req.session.role=='Superadmin')
						res.render(__dirname+'/superadminprofile',{pId:req.session.picId,name:req.session.name,data : updata});
					else
						res.render(__dirname+'/adminprofile',{pId:req.session.picId,name:req.session.name,data : updata});
				}
			});
		}
		else if(req.session.isLogin==5&&req.session.role=='Admin')
			res.sendFile(__dirname+'/broken.html');
		else
			res.redirect('/');
	}
	else
	{
		res.redirect('/');
	}
});

router.get('/switchAsUser',function(req,res){
	if(req.session.isLogin==1)
	{
		req.session.isLogin=2;
		res.sendFile(__dirname+'/loading.html');
	}
	else
	{
		res.redirect('/');
	}
});

router.get('/switchAsAdmin',function(req,res){
	if(req.session.isLogin==2)
	{
		req.session.isLogin=1;
		res.sendFile(__dirname+'/loading1.html');
	}
	else
	{
		res.redirect('/');
	}
});

router.get('/loading.gif',function(req,res){
	res.sendFile(__dirname+'/loading.gif');
});

router.get('/userlist',function(req,res){
	if(req.session.isLogin)
	{
		if(req.session.isLogin==1&&req.session.role=='Superadmin')
			res.render(__dirname+'/userList',{pId:req.session.picId,name:req.session.name});
		else if(req.session.isLogin==1&&req.session.role=='Admin')
			res.render(__dirname+'/adminuserList',{pId:req.session.picId,name:req.session.name});
		else
			res.redirect('/');	
	}
	else
	{
		res.redirect('/');
	}
});

router.get('/404.png',function(req,res){
	res.sendFile(__dirname+'/404.png');
});

router.get('/DataTables.css',function(req,res){
	res.sendFile(__dirname+'/DataTables.css');
});

router.get('/sort_asc.png',function(req,res){
	res.sendFile(__dirname+'/sort_asc.png');
});

router.get('/sort_asc_disabled.png',function(req,res){
	res.sendFile(__dirname+'/sort_asc_disabled.png');
});

router.get('/sort_both.png',function(req,res){
	res.sendFile(__dirname+'/sort_both.png');
});

router.get('/sort_desc.png',function(req,res){
	res.sendFile(__dirname+'/sort_desc.png');
});

router.get('/sort_desc_disabled.png',function(req,res){
	res.sendFile(__dirname+'/sort_desc_disabled.png');
});

router.get('/adduser',function(req,res){
	if(req.session.isLogin==1)
	{
		if(req.session.role=='Superadmin')
			res.render(__dirname+'/adduser',{pId:req.session.picId,name:req.session.name});
		else if(req.session.role=='Admin')
			res.render(__dirname+'/adminadduser',{pId:req.session.picId,name:req.session.name});
	}
	else
	{
		res.redirect('/');
	}
});

router.get('/getUsers',function(req,res){
	userDetails.find({}).exec(function(err,data){
		if(err)
			throw err;
		res.send(data);
	});
});

router.put('/activation',function(req,res)
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

router.put('/updateUser',function(req,res)
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

router.post('/addUsers',function(req,res)
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

module.exports = router;