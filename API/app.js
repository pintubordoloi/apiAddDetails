const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
require('dotenv/config');

const app = express()

const mongoURI = 'mongodb+srv://APITester:apitester@cluster-technohuge-api.uchpq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
app.use(bodyParser.json());

//importing routes
const routeML = require('./routes/machineLearning');
const blogRoute = require('./routes/blogs');
const routeGD = require('./routes/gameDevelopment');
const routeWD = require('./routes/webDevelopment');
const routeBP = require('./routes/basicProgramming');

app.use('/blogs',blogRoute);
app.use('/machineLearning',routeML);
app.use('/webDevelopment',routeWD);
app.use('/gameDevelopment',routeGD);
app.use('/basicProgramming',routeBP);

app.get('/',(req,res) => {
    res.send('We are on home');
})

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

const conn = mongoose.createConnection(process.env.DB_CONNECTION);

let gfs;

conn.once('open',()=>{
    gfs = Grid(conn.db, mongoose.mongo)
    gfs.collection('uploads')
})

const storage = new GridFsStorage({
    url: mongoURI,
    file:(req,file)=>{
        return new Promise((resolve, reject) =>{
            crypto.randomBytes(16,(err,buf)=>{
                if(err){
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            })
            
        });
    }
})

const upload = multer({storage});

app.post('/upload',upload.single('file'),(req,res)=>{
    res.json({file:req.file});
})

app.get('/files',(req,res) =>{
    gfs.files.find().toArray((err,files) => {
        if(!files || files.length === 0)
        {
            return res.status(404).json({
                err: 'No files exist'
            });
        }
        return res.json(files);
    })
        
})

app.listen(3000,() => console.log('server connected'));

module.exports = app;
module.exports = conn;