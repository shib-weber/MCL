const http=require('http');
const express = require('express')
const bodyParser= require('body-parser')
const {Server}=require('socket.io')
const mongoose=require('mongoose')
const Player = require('./models/player');
const multer = require('multer');
const path = require('path')
const methodOverride = require('method-override');
const cors = require('cors')
require('dotenv').config();

const PORT= 5000;

const app=express()
const server=http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins (adjust as needed for security)
        methods: ['GET', 'POST'],
    },
});

mongoose.connect(process.env.MongoUrl, {
  }).then(()=>
console.log("mongodb Connected")
).catch(err => console.error("MongoDB Connection Error:", err));

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname,'public')))
app.use('/uploads', express.static('uploads'));


app.get('/',(req,res)=>{
    return res.render('home')
})

app.get('/data',(req,res)=>{
    return res.render('data')
})

/*const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Directory where files will be saved
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original filename without any modifications
    }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });*/

app.post('/data', async (req, res) => {
    console.log('here')
    try {
        const { pic, slno, name, year, role } = req.body;

        // Check for file size limit on server side (optional)
        /*const maxSize = 60 * 1024; //  60 KB in bytes
        if (Buffer.byteLength(pic) > maxSize) {
            return res.status(400).json({ message: 'File size exceeds the 5 MB limit.' });
        }*/

        const newPlayer = new Player({
            pic, // This will now be a data URL string
            slno,
            name,
            year,
            role
        });

        await newPlayer.save();
        res.status(201).json({ message: 'Player data saved successfully', player: newPlayer });
    } catch (error) {
        console.error('Error saving player data:', error);
        res.status(500).json({ message: 'Error saving player data' });
    }
});


app.get('/player/:slno', async (req, res) => {
    const { slno } = req.params;

    try {
        // Find the player by their serial number
        const player = await Player.findOne({ slno });

        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        

        // Send player data, including the image URL or filename
        res.status(200).json({
            slno: player.slno,
            name: player.name,
            year: player.year,
            role: player.role,
            pic: `${player.pic}` // Assuming you're storing image filenames
        });
    } catch (error) {
        console.error('Error retrieving player data:', error);
        res.status(500).json({ message: 'Error retrieving player data' });
    }
});

app.get('/players',async(req,res)=>{
    const players = await Player.find({})
    return res.render('player',{players})
})

app.delete('/players/:id', async (req, res) => {
    const { id } = req.params;
    await Player.findByIdAndDelete(id);
    res.redirect('/players');
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('l-bar-up', () => {
        io.emit('l-bar-up');
    });
    socket.on('l-bar-down', () => {
        io.emit('l-bar-down');
    });
    socket.on('r-bar-up', () => {
        io.emit('r-bar-up');
    });
    socket.on('r-bar-down', () => {
        io.emit('r-bar-down');
    });
    socket.on('updated-bid',({i,v}) =>{
        io.emit('updated-bid',({i,v}))
    });
    socket.on('reset',()=>{
        io.emit('reset')
    })
    socket.on('text-added',(input)=>{
        io.emit('text-added',(input))
    })
    socket.on('player-update',(player)=>{
        io.emit('player-update',(player))
    })
    socket.on('sold',()=>{
        io.emit('sold')
    })
    socket.on('unsold',()=>{
        io.emit('unsold')
    })
})

app.set('view engine','ejs')
app.set('views',path.resolve('./views'))

server.listen(PORT,()=>{
    console.log('server is running on PORT :',PORT)
})