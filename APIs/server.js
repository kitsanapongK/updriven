const aws = require('aws-sdk')
const express = require('express');
const passport = require('passport');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const migrations = require("./app/migrations/migrations");
const cors = require("cors");
const db = require("./app/models");
const multer = require('multer')
const multerS3 = require('multer-s3')
const fs = require('fs')
require('./app/passport/passport');
require('dotenv').config()

const app = express();

app.use(cookieSession({
  name: process.env.SESSION_PREFIX + 'session',
  keys: ['key1', 'key2']
}))

//CDN Setting
aws.config.update({
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  accessKeyId: process.env.ACCESS_KEY_ID,
  region: process.env.REGION
});

app.use(multer({
  storage: multerS3({
      s3: new aws.S3(),
      bucket: 'updriven',
      acl: 'public-read',
      key: function (req, file, cb) {
        const extension = file.originalname.split(".");
        cb(null, Date.now().toString() + '.' + extension[extension.length - 1])
      }
  }),
  limits: { fileSize: process.env.UPLOAD_MAX_SIZE }
}).array('media'));

// CORS
const cleintDomain = process.env.CLIENT_URL.replace(/http:\/\/|https:\/\/|\//g, '');
const cleintDir = process.env.CLIENT_DIR.replace(/http:\/\/|https:\/\/|\//g, '');
const corsOptions = {
  origin: [
    new RegExp(`${cleintDomain}$`),
    new RegExp(`${cleintDir}$`)
  ], 
  credentials: true,
  // optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors( corsOptions )); // remove corsOptions to allow all origins

// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

app.use(passport.initialize());
app.use(passport.session());

const port = process.env.PORT

require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/post.routes")(app);
require("./app/routes/feed.routes")(app);
require("./app/routes/admin.routes")(app);

server = app.listen(port, () => console.log("server running on port " + port))

//socket.io instantiation
const io = require("socket.io")(server, {
  cors: {
      origin: /localhost$/,
      methods: ["GET", "POST"],
      credentials: true
  }
});
//listen on every connection
io.on('connection', (socket) => {
  socket.on('join-with-id',(data) => {
      socket.join(data.user_id);
    //   User.findById(data.user_id).exec((err,user) => {
          io.in(data.user_id).emit('receive-notify',
          {
              user_id: data.user_id,
              notification:  1//user.notification
          });
    //       }
    //   );
  });
  socket.on('sent-realtime-notify' , (data) =>{
    io.in(data.user_id).emit('get-count-notify',{
        sentiment_type: data.sentiment_type,
        post_id: data.post_id,
        user_id: data.user_id,
        user_like_post_id: data.user_like_post_id,
        user_like_post_firstname: data.user_like_post_firstname ,
        user_like_post_lastname: data.user_like_post_lastname,
    });
        
  });
  
  socket.on('join', (data) => {
      socket.join(data.job_id);
  });

  socket.on('disconnect', () => {

  });

  socket.on('send-message', (data) => {
      User.findById(data.user_id)
      .populate('avatar')
      .exec((err, result) => {
          socket.to(data.job_id).emit('recive-message', 
          { 
              user_id: data.user_id,
              message: data.message,
              job_id: data.job_id,
              createdAt: new Date(data.createdAt),
              avatar: result.avatar[0].value,
              username: result.username
          });
          const chat = new Chat({
              message: data.message,
              });    
          chat.user.push(data.user_id);
          chat.job.push(data.job_id);
          chat.save();
      });
  })
})

// connect to database
db.mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
.then(() => {
    console.log("Successfully connect to MongoDB.");
    migrations.initial();
})
.catch(err => {
    console.error("Connection error", err);
    process.exit();
});