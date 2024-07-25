const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // Import the cors middleware

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the 'build' directory
app.use(express.static(path.join(__dirname, 'build')));

// Database setup
const db = new sqlite3.Database('budget.db', (err) => {
    if (err) {
        console.error('Error opening database: ', err.message);
    } else {
        console.log('Connected to the budget database');
        db.run(`CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            category TEXT,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// Add CORS middleware to allow requests from any origin
app.use(cors());

// API endpoints
app.get('/api/transactions', (req, res) => {
    db.all('SELECT * FROM transactions', (err, rows) => {
        if (err) {
            console.error('Error fetching transactions: ', err.message);
            res.status(500).json({ error: 'Error fetching transactions' });
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/transactions', express.json(), (req, res) => {
    const { type, description, amount, category } = req.body;
    db.run('INSERT INTO transactions (type, description, amount, category) VALUES (?, ?, ?, ?)', [type, description, amount, category], function(err) {
        if (err) {
            console.error('Error inserting transaction: ', err.message);
            res.status(500).json({ error: 'Error inserting transaction' });
        } else {
            res.status(201).json({ id: this.lastID, message: 'Transaction added successfully' });
        }
    });
});

// Endpoint to clear transactions
app.delete('/api/transactions/clear', (req, res) => {
    db.run('DELETE FROM transactions', (err) => {
        if (err) {
            console.error('Error clearing transactions: ', err.message);
            res.status(500).json({ error: 'Error clearing transactions' });
        } else {
            console.log('Transactions cleared successfully');
            res.status(200).json({ message: 'Transactions cleared successfully' });
        }
    });
});

// Serve index.html for any other routes to enable client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
