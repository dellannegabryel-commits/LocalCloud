const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Endpoints

// 1. Upload File
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { originalname, filename, path: filePath, size, mimetype } = req.file;

    db.run(
        `INSERT INTO files (original_name, filename, path, size, mimetype) VALUES (?, ?, ?, ?, ?)`,
        [originalname, filename, filePath, size, mimetype],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                id: this.lastID,
                originalname,
                filename,
                size,
                mimetype
            });
        }
    );
});

// 2. List Files
app.get('/files', (req, res) => {
    db.all(`SELECT * FROM files ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// 3. Download File
app.get('/download/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM files WHERE id = ?`, [id], (err, file) => {
        if (err || !file) {
            return res.status(404).json({ error: 'File not found.' });
        }
        res.download(file.path, file.original_name);
    });
});

// 4. Delete File
app.delete('/files/:id', (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM files WHERE id = ?`, [id], (err, file) => {
        if (err || !file) {
            return res.status(404).json({ error: 'File not found.' });
        }

        // Remove from disk
        fs.unlink(file.path, (unlinkErr) => {
            // Even if file is missing from disk, we might want to remove entry from DB
            if (unlinkErr && unlinkErr.code !== 'ENOENT') {
                return res.status(500).json({ error: 'Error deleting physical file.' });
            }

            // Remove from DB
            db.run(`DELETE FROM files WHERE id = ?`, [id], (delErr) => {
                if (delErr) {
                    return res.status(500).json({ error: delErr.message });
                }
                res.json({ message: 'File deleted successfully.' });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
