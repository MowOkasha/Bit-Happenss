const express = require('express');
const session = require('express-session');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

// MongoDB configuration
const uri = 'mongodb://localhost:27017';
const dbName = 'myDB';
const collectionName = 'myCollection';
let db;
let useMongoDB = false;

// In-memory fallback storage
let users = [];

// Try to connect to MongoDB
MongoClient.connect(uri)
    .then(client => {
        console.log('✓ Connected to MongoDB successfully');
        db = client.db(dbName);
        useMongoDB = true;
        console.log(`✓ Using database: ${dbName}`);
        console.log(`✓ Using collection: ${collectionName}`);
    })
    .catch(err => {
        console.log('⚠️  MongoDB not available - using in-memory storage');
        console.log('💡 To install MongoDB: brew tap mongodb/brew && brew install mongodb-community');
        console.log('💡 Then start it: brew services start mongodb-community');
        console.log('');
        useMongoDB = false;
    });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// Session configuration
app.use(session({
    secret: 'travel-website-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Sample destinations data
const destinations = {
    beaches: [
        {
            name: 'Santorini',
            description: 'Santorini is one of the Cyclades islands in the Aegean Sea. It was devastated by a volcanic eruption in the 16th century BC, forever shaping its rugged landscape.',
            image: 'santorini.png',
            video: 'https://www.youtube.com/embed/m5dKGNEmwG8',
            category: 'beaches'
        },
        {
            name: 'Bali',
            description: 'Bali is a province of Indonesia and the westernmost of the Lesser Sunda Islands. Located east of Java and west of Lombok.',
            image: 'bali.png',
            video: 'https://www.youtube.com/embed/w_T6XQYn5qE',
            category: 'beaches'
        }
    ],
    mountains: [
        {
            name: 'Annapurna',
            description: 'Annapurna is a massif in the Himalayas in north-central Nepal that includes one peak over 8,000 metres.',
            image: 'annapurna.png',
            video: 'https://www.youtube.com/embed/YQq_7s4vs-I',
            category: 'mountains'
        },
        {
            name: 'Inca Trail',
            description: 'The Inca Trail to Machu Picchu is a hiking trail in Peru that terminates at Machu Picchu.',
            image: 'inca.png',
            video: 'https://www.youtube.com/embed/61-U40hW6u0',
            category: 'mountains'
        }
    ],
    cities: [
        {
            name: 'Paris',
            description: 'Paris, France capital, is a major European city and a global center for art, fashion, gastronomy and culture.',
            image: 'paris.png',
            video: 'https://www.youtube.com/embed/AQ6GmpMu5L8',
            category: 'cities'
        },
        {
            name: 'Rome',
            description: 'Rome is the capital city of Italy. It is also the capital of the Lazio region.',
            image: 'rome.png',
            video: 'https://www.youtube.com/embed/cllSeOG8S7s',
            category: 'cities'
        }
    ]
};

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    const message = req.session.message || '';
    req.session.message = '';
    res.render('login', { message });
});

app.get('/registration', (req, res) => {
    const message = req.session.message || '';
    req.session.message = '';
    res.render('registration', { message });
});

app.get('/home', requireLogin, (req, res) => {
    const loginSuccess = req.session.loginSuccess || false;
    req.session.loginSuccess = false; // Clear the flag
    res.render('home', { 
        username: req.session.username,
        loginSuccess: loginSuccess
    });
});

app.get('/islands', requireLogin, (req, res) => {
    res.render('islands', { 
        destinations: destinations.beaches,
        username: req.session.username 
    });
});

app.get('/hiking', requireLogin, (req, res) => {
    res.render('hiking', { 
        destinations: destinations.mountains,
        username: req.session.username 
    });
});

app.get('/cities', requireLogin, (req, res) => {
    res.render('cities', { 
        destinations: destinations.cities,
        username: req.session.username 
    });
});

app.get('/santorini', requireLogin, (req, res) => {
    const destination = destinations.beaches.find(d => d.name === 'Santorini');
    const message = req.session.message || '';
    req.session.message = '';
    res.render('santorini', { 
        destination,
        username: req.session.username,
        message 
    });
});

app.get('/bali', requireLogin, (req, res) => {
    const destination = destinations.beaches.find(d => d.name === 'Bali');
    const message = req.session.message || '';
    req.session.message = '';
    res.render('bali', { 
        destination,
        username: req.session.username,
        message 
    });
});

app.get('/annapurna', requireLogin, (req, res) => {
    const destination = destinations.mountains.find(d => d.name === 'Annapurna');
    const message = req.session.message || '';
    req.session.message = '';
    res.render('annapurna', { 
        destination,
        username: req.session.username,
        message 
    });
});

app.get('/inca', requireLogin, (req, res) => {
    const destination = destinations.mountains.find(d => d.name === 'Inca Trail');
    const message = req.session.message || '';
    req.session.message = '';
    res.render('inca', { 
        destination,
        username: req.session.username,
        message 
    });
});

app.get('/paris', requireLogin, (req, res) => {
    const destination = destinations.cities.find(d => d.name === 'Paris');
    const message = req.session.message || '';
    req.session.message = '';
    res.render('paris', { 
        destination,
        username: req.session.username,
        message 
    });
});

app.get('/rome', requireLogin, (req, res) => {
    const destination = destinations.cities.find(d => d.name === 'Rome');
    const message = req.session.message || '';
    req.session.message = '';
    res.render('rome', { 
        destination,
        username: req.session.username,
        message 
    });
});

app.get('/wanttogo', requireLogin, async (req, res) => {
    try {
        let wantToGoList = [];
        
        if (useMongoDB) {
            const user = await db.collection(collectionName).findOne({ username: req.session.username });
            wantToGoList = user?.wantToGoList || [];
        } else {
            const user = users.find(u => u.username === req.session.username);
            wantToGoList = user?.wantToGoList || [];
        }
        
        const wantToGoDestinations = [];
        for (const destName of wantToGoList) {
            for (const category of Object.values(destinations)) {
                const dest = category.find(d => d.name === destName);
                if (dest) {
                    wantToGoDestinations.push(dest);
                    break;
                }
            }
        }
        
        res.render('wanttogo', { 
            destinations: wantToGoDestinations,
            username: req.session.username 
        });
    } catch (err) {
        console.error('Error fetching want-to-go list:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/searchresults', requireLogin, (req, res) => {
    const searchQuery = req.query.search || '';
    let searchResults = [];
    
    if (searchQuery) {
        for (const category of Object.values(destinations)) {
            for (const destination of category) {
                if (destination.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                    searchResults.push(destination);
                }
            }
        }
    }
    
    res.render('searchresults', { 
        searchResults,
        searchQuery,
        username: req.session.username 
    });
});

// POST routes
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            req.session.message = 'Username and password cannot be empty.';
            return res.redirect('/registration');
        }
        
        if (username.length < 3) {
            req.session.message = 'Username must be at least 3 characters long.';
            return res.redirect('/registration');
        }
        
        if (password.length < 4) {
            req.session.message = 'Password must be at least 4 characters long.';
            return res.redirect('/registration');
        }
        
        if (useMongoDB) {
            // Check if user already exists in MongoDB
            const existingUser = await db.collection(collectionName).findOne({ username });
            if (existingUser) {
                req.session.message = 'Username already taken. Please choose a different username.';
                return res.redirect('/registration');
            }
            
            // Add user to MongoDB
            await db.collection(collectionName).insertOne({
                username,
                password,
                wantToGoList: [],
                createdAt: new Date()
            });
        } else {
            // In-memory storage
            const existingUser = users.find(u => u.username === username);
            if (existingUser) {
                req.session.message = 'Username already taken. Please choose a different username.';
                return res.redirect('/registration');
            }
            
            users.push({
                username,
                password,
                wantToGoList: []
            });
        }
        
        console.log(`✓ New user registered: ${username}`);
        req.session.message = '✓ Registration successful! You can now log in.';
        res.redirect('/login');
    } catch (err) {
        console.error('Registration error:', err);
        req.session.message = 'An error occurred during registration. Please try again.';
        res.redirect('/registration');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            req.session.message = 'Please enter both username and password.';
            return res.redirect('/login');
        }
        
        let user;
        if (useMongoDB) {
            // Find user in MongoDB
            user = await db.collection(collectionName).findOne({ username, password });
            if (user) {
                req.session.userId = user._id.toString();
            }
        } else {
            // Find user in memory
            user = users.find(u => u.username === username && u.password === password);
            if (user) {
                req.session.userId = username;
            }
        }
        
        if (user) {
            req.session.username = username;
            console.log(`✓ User logged in: ${username}`);
            req.session.loginSuccess = true;
            res.redirect('/home');
        } else {
            req.session.message = 'Invalid username or password. Please try again.';
            res.redirect('/login');
        }
    } catch (err) {
        console.error('Login error:', err);
        req.session.message = 'An error occurred during login. Please try again.';
        res.redirect('/login');
    }
});

app.post('/addToWantToGo', requireLogin, async (req, res) => {
    try {
        const { destination } = req.body;
        const username = req.session.username;
        
        if (useMongoDB) {
            // Check if destination is already in user's list
            const user = await db.collection(collectionName).findOne({ username });
            if (user.wantToGoList && user.wantToGoList.includes(destination)) {
                req.session.message = 'This destination is already in your want-to-go list.';
            } else {
                // Add destination to user's want-to-go list in MongoDB
                await db.collection(collectionName).updateOne(
                    { username },
                    { $push: { wantToGoList: destination } }
                );
                req.session.message = 'Destination added to your want-to-go list!';
                console.log(`✓ ${username} added ${destination} to their list`);
            }
        } else {
            // In-memory storage
            const user = users.find(u => u.username === username);
            if (user.wantToGoList && user.wantToGoList.includes(destination)) {
                req.session.message = 'This destination is already in your want-to-go list.';
            } else {
                user.wantToGoList.push(destination);
                req.session.message = 'Destination added to your want-to-go list!';
                console.log(`✓ ${username} added ${destination} to their list`);
            }
        }
        
        const destRoute = destination.toLowerCase().replace(' trail', '').replace(' ', '');
        res.redirect(`/${destRoute}`);
    } catch (err) {
        console.error('Error adding to want-to-go list:', err);
        req.session.message = 'An error occurred while adding to your list.';
        res.redirect('/home');
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
});

app.listen(port, () => {
    console.log('');
    console.log('='.repeat(60));
    console.log(`🚀 Travel Website is running!`);
    console.log(`📍 URL: http://localhost:${port}`);
    console.log(`💾 Storage: ${useMongoDB ? 'MongoDB (myDB/myCollection)' : 'In-Memory (temporary)'}`);
    console.log('='.repeat(60));
    console.log('');
    if (!useMongoDB) {
        console.log('💡 To use MongoDB (recommended for project submission):');
        console.log('   1. brew tap mongodb/brew');
        console.log('   2. brew install mongodb-community');
        console.log('   3. brew services start mongodb-community');
        console.log('   4. Restart this server');
        console.log('');
    }
    console.log('✨ Open http://localhost:3000 in your browser to get started!');
    console.log('');
});
