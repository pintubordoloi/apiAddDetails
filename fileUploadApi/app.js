
const express = require('express');
const bodyParser = require('crypto');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();

//app.use(bodyParser.json());
app.use(methodOverride('_method'));

//mongo usi
const mongoURI = 'mongodb+srv://APITester:apitester@cluster-technohuge-api.uchpq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const conn = mongoose.createConnection(mongoURI);

app.set('view engine', 'ejs');

//init gfs
let gfs;

conn.once('open',() =>{
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads')
})

//Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file:(req,file)=>{
        return new Promise((resolve, reject)=>{
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
            });
        });
    }
});

const upload = multer({storage});

//@route GET/
//@desc Loads form
app.get('/',(req,res) =>{
    res.json({file:req.file});
    
});

app.post('/upload',upload.single('file'),(req,res)=>{
    res.json({file:req.file});
})

//@route Get/files
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

const port = 5000;

app.listen(port, () => console.log('Sever started on pot ${port}'));