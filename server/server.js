const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'antigravity_secret_key';

app.use(cors());
app.use(express.json());

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Middleware for auth
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Token is missing' });
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token is invalid' });
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ id: this.lastID, name, email });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    });
});

// --- PRODUCT ROUTES ---
app.get('/api/products', (req, res) => {
    db.all('SELECT products.*, users.name as seller_name FROM products JOIN users ON products.seller_id = users.id', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.post('/api/products', authenticateToken, upload.single('image'), (req, res) => {
    const { title, description, price } = req.body;
    const seller_id = req.user.id;
    let image = req.body.image || '';

    if (req.file) {
        image = `/uploads/${req.file.filename}`;
    }

    if (!title || !price) {
        return res.status(400).json({ error: 'Title and price are required' });
    }

    db.run('INSERT INTO products (title, description, price, image, seller_id) VALUES (?, ?, ?, ?, ?)', 
        [title, description, price, image, seller_id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        db.get('SELECT products.*, users.name as seller_name FROM products JOIN users ON products.seller_id = users.id WHERE products.id = ?', [this.lastID], (err, row) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json(row);
        });
    });
});

// --- ORDER / NOTIFICATION ROUTES ---
app.post('/api/orders', authenticateToken, (req, res) => {
    const { product_id, seller_id } = req.body;
    const buyer_id = req.user.id;

    if (!product_id || !seller_id) {
        return res.status(400).json({ error: 'Product and seller are required' });
    }

    if (buyer_id === seller_id) {
        return res.status(400).json({ error: 'You cannot buy your own item' });
    }

    // Check if duplicate order
    db.get('SELECT * FROM orders WHERE product_id = ? AND buyer_id = ?', [product_id, buyer_id], (err, order) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (order) return res.status(400).json({ error: 'You have already placed an order for this item' });

        db.run('INSERT INTO orders (product_id, buyer_id, seller_id) VALUES (?, ?, ?)',
            [product_id, buyer_id, seller_id], function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json({ message: 'Seller notified successfully!', id: this.lastID });
        });
    });
});

app.get('/api/notifications', authenticateToken, (req, res) => {
    // Only fetch orders where the current user is the seller
    const seller_id = req.user.id;

    const query = `
        SELECT orders.*, products.title as product_title, products.price as product_price, users.name as buyer_name, users.email as buyer_email
        FROM orders
        JOIN products ON orders.product_id = products.id
        JOIN users ON orders.buyer_id = users.id
        WHERE orders.seller_id = ?
        ORDER BY orders.created_at DESC
    `;

    db.all(query, [seller_id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
