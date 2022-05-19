//jshint esversion:6
// these are all the libraries installed using npm. some of them are added for future use
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const multer = require('multer');
const uuid = require('uuid').v4;
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const exphbs = require("express-handlebars");
const nodemailer =require("nodemailer");



// this part includes banner messages for home, about us, and contact pages.
const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


// part initialize the required libraries and sets their configurations.
// the code is mostly copied from the documentaion of each package.
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
const uploadDir = 'public/uploads'
var post_counter = 0;
const storage = multer.diskStorage({

  destination: (req, res, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const {
      originalname
    } = file;
    cb(null, originalname);
    //cb(null, 'post_' + post_counter + path.extname(file.originalname));
  }


});
const upload = multer({
  storage: storage
});

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "00171",
  database: 'omar_blog'
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});












// get functions start ---------------------------------

// this callback function is responsible for rendering the home page and retreiving posts
// content from the database.
app.get("/", function (req, res) {
  var results_sent = 0;
  con.query("SELECT title, body, img_name FROM posts", function (err, result, fields) {
    if (err) throw err;
    results_sent = result;
    res.render("home", {
      startContent: homeStartingContent,
      postsArray: results_sent,

    });

  });


});




// this callback function renders the about us page --> nothing fancy here
app.get("/about", function (req, res) {
  res.render("about", {
    aboutContentPart: aboutContent
  });
});

// this callback function renders the contact page --> nothing fancy here too.
app.get("/contact", function (req, res) {
  res.render("contact", {
    contanctContentPart: contactContent
  });
});


// this callback renders the compose bage for the admin to insert new posts into the website
app.get("/compose", function (req, res) {
  res.render("compose");
});


// this callback renders individual posts pages by retreiving the whole content form the database
app.get("/posts/:postName", function (req, res) {
  const requestedTitle_sql = req.params.postName;
  console.log(requestedTitle_sql);



  con.query("SELECT title, body, img_name FROM posts WHERE title = ?", requestedTitle_sql, function (err, result, fields) {
    if (err) throw err;

    results_sent_post = result;
    //console.log(result[0].img_name);
    // console.log('-----------');
    //console.log(results_sent);
    console.log(results_sent_post);


    var results_sent_comments = 0;
    con.query("SELECT  commentPostTitle, commentCreator, creatorEmail, body FROM comments WHERE commentPostTitle = ?", requestedTitle_sql, function (err, result, fields) {
      if (err) throw err;

      results_sent_comments = result;
      console.log(results_sent_comments);
      console.log(results_sent_post);

      res.render("post", {
        Post_sql_array: results_sent_post,
        comment_sql_array: results_sent_comments

      });
    });
  });


});




// this page is rendered when a user registers his/her email to the newsletter list
app.get('/subThx', (req, res) => {

  res.render("subThanks");
  
});



// get functions end  --------------- X ------------------





// post functions start ------------------------------------

// this callback receives the post content and stores it into the database
app.post('/compose', upload.single('avatar'), (req, res) => {

  let wholePost = {
    title: req.body.postTitle,
    body: req.body.postBody,
    img_name: req.file.filename
  };

  let sql = 'INSERT INTO posts SET ?'
  let queryDb = con.query(sql, wholePost, function (err, result) {
    if (err) throw err;
    console.log("1 post inserted");
  });


  res.redirect("/");

});




// this method receives comments from blog viewers and store their comments into the database
app.post('/comment', (req, res) => {


  const pushedComment = {
    commentCreator: req.body.commentName,
    creatorEmail: req.body.commentEmail,
    body: req.body.commentBody,
    commentPostTitle: req.body.commentPostTitle_submit
  };


  let sql_2 = 'INSERT INTO comments SET ?'
  let queryDb_2 = con.query(sql_2, pushedComment, function (err, result) {
    if (err) throw err;
    console.log("comment is inserted successfully");
    console.log(pushedComment);
  });

  res.redirect("/posts/" + pushedComment.commentPostTitle);

});






// interested users register their emails for regular newsletter from blog auther.
// this callback function receives their emails and store them in the database
app.post('/subscribe', (req, res) => {


  const received_content = {
    
    newsletterEmail_mysql: req.body.newsletterEmail,
   
  };

  let sql_2 = 'INSERT INTO newsletterEmails SET ?'
  let queryDb_2 = con.query(sql_2, received_content, function (err, result) {
    if (err) throw err;
    console.log("newsletterEmail is inserted successfully");
    console.log(received_content);
  });

  res.redirect("/subThx");

});



// post functions end --------------- X ---------------------


// server binding to the port 3000 on the local host.
// this part changes in production depending of the hosting service provider.

app.listen(3000, function () {
  console.log("Server started on port 3000");
});