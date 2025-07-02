const express = require('express');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'ALKDLAKDLA2334359SKSK@RLFSLDFLSFSDL746';

// middleware :-

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Authenticate JWT token middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Token required' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });

        req.user = user;
        next();
    });
};


const loadUsers = async () => {
    try {
        const data = await fs.readFile('./users.json', 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
};

const saveUsers = async (users) => {
    await fs.writeFile('./users.json', JSON.stringify(users, null, 2));
};

const loadBooks = async () => {
    try {
        const data = await fs.readFile('./books.json', 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
};

const saveBooks = async (books) => {
    await fs.writeFile('./books.json', JSON.stringify(books, null, 2));
};

// routes

// Register
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const users = await loadUsers();

    const existing = users.find(u => u.email === email);
    if (existing) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = {
        id: uuidv4(),
        email,
        password // 🔥 For production, hash passwords!
    };

    users.push(newUser);
    await saveUsers(users);

    res.status(201).json({ message: 'User registered successfully' });
});

// Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const users = await loadUsers();

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
});

// book Routes

// Get All Books (Optional Pagination and Search by Genre)
app.get('/books', authenticateToken, async (req, res) => {
    const { genre, page = 1, limit = 10 } = req.query;
    let books = await loadBooks();

    if (genre) {
        books = books.filter(b => b.genre.toLowerCase() === genre.toLowerCase());
    }
    
    const start = (page - 1) * limit;
    const end = start + parseInt(limit);
    const paginatedBooks = books.slice(start, end);

    res.json({
        total: books.length,
        page: parseInt(page),
        limit: parseInt(limit),
        books: paginatedBooks
    });
});

// Get Book by ID
app.get('/books/:id', authenticateToken, async (req, res) => {
    const books = await loadBooks();
    const book = books.find(b => b.id === req.params.id);

    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
});

// Create a Book
app.post('/books', authenticateToken, async (req, res) => {
    const { title, author, genre, publishedYear } = req.body;
    const books = await loadBooks();

    const newBook = {
        id: uuidv4(),
        title,
        author,
        genre,
        publishedYear,
        userId: req.user.id
    };

    books.push(newBook);
    await saveBooks(books);

    res.status(201).json({ message: 'Book created', book: newBook });
});

// Update Book (only owner)
app.put('/books/:id', authenticateToken, async (req, res) => {
    const { title, author, genre, publishedYear } = req.body;
    const books = await loadBooks();
    const bookIndex = books.findIndex(b => b.id === req.params.id);

    if (bookIndex === -1) {
        return res.status(404).json({ message: 'Book not found' });
    }

    const book = books[bookIndex];

    if (book.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this book' });
    }

    const updatedBook = {
        ...book,
        title: title ?? book.title,
        author: author ?? book.author,
        genre: genre ?? book.genre,
        publishedYear: publishedYear ?? book.publishedYear
    };

    books[bookIndex] = updatedBook;
    await saveBooks(books);

    res.json({ message: 'Book updated', book: updatedBook });
});

// Delete Book (only owner)
app.delete('/books/:id', authenticateToken, async (req, res) => {
    const books = await loadBooks();
    const book = books.find(b => b.id === req.params.id);

    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }

    if (book.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this book' });
    }

    const updatedBooks = books.filter(b => b.id !== req.params.id);
    await saveBooks(updatedBooks);

    res.json({ message: 'Book deleted' });
});

// ================= Error Handling =================

// 404 Middleware
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Error Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong' });
});

// ================= Start Server =================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
