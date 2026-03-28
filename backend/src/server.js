const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database/database');

const app = express();
const PORT = process.env.PORT || 4000; // Backend runs on port 4000 as per Nginx proxy

// Ensure uploads directory exists
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests from localhost and 127.0.0.1 for direct backend access and frontend development
        const allowedLocalOrigins = [
            'http://localhost',
            'http://localhost:80',
            'http://127.0.0.1',
            'http://127.0.0.1:80',
            'http://localhost:4000', // Direct backend access for testing
            'http://127.0.0.1:4000',
        ];

        // --- IMPORTANT: Configure your host machine's IP address on the local network here ---
        // This is crucial for accessing from other devices.
        // Find your IP by running `ip addr show` (Linux/macOS) or `ipconfig` (Windows).
        // Example: Replace 'YOUR_LOCAL_NETWORK_IP' with your actual IP like '192.168.1.100'.
        const YOUR_LOCAL_NETWORK_IP = '192.168.10.101'; // <-- REPLACE WITH YOUR HOST'S ACTUAL LOCAL IP ADDRESS IF DIFFERENT FROM YOUR ACCESS IP

        const allowedNetworkOrigins = [
            `http://${YOUR_LOCAL_NETWORK_IP}`,
            `${YOUR_LOCAL_NETWORK_IP}:80`,     // If accessing via Nginx on port 80
            `${YOUR_LOCAL_NETWORK_IP}:4000`   // If accessing backend directly on port 4000
        ];

        const allAllowedOrigins = [...allowedLocalOrigins, ...allowedNetworkOrigins];

        // Check if the requesting origin is in our allowed list or if there's no origin (e.g., internal Docker requests)
        if (allAllowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            console.warn(`CORS request blocked from origin: ${origin}`);
            callback(new Error('CORS policy: Origin not allowed'), false);
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true // If cookies or authentication headers are involved
}));

app.use(express.json());
// Use the resolved path for uploads directory
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads'))); 

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR); // Use the resolved path
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    // Removed limits.fileSize: Infinity for standard behavior. 
    // If specific limits are needed, they can be added here, e.g., limits: { fileSize: 20 * 1024 * 1024 } for 20MB.
});

// --- API Endpoints ---

// 1. Upload File
app.post('/api/upload', upload.single('file'), (req, res) => { // Changed to /api/upload
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const { originalname, filename, path: filePath, size, mimetype } = req.file;

    db.run(
        `INSERT INTO files (original_name, filename, path, size, mimetype, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`, // Added created_at
        [originalname, filename, filePath, size, mimetype],
        function (err) {
            if (err) {
                console.error('Database error on file insert:', err.message); // Log the error
                return res.status(500).json({ error: 'Erro ao salvar o arquivo no banco de dados.' });
            }
            console.log(`File uploaded and saved to DB: ${originalname} (ID: ${this.lastID})`);
            res.status(201).json({
                id: this.lastID,
                originalname,
                filename,
                size,
                mimetype,
                created_at: new Date().toISOString() // Return created_at
            });
        }
    );
});

// 2. List Files
app.get('/api/files', (req, res) => { // Changed to /api/files
    db.all(`SELECT * FROM files ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            console.error('Database error listing files:', err.message);
            return res.status(500).json({ error: 'Erro ao listar arquivos.' });
        }
        res.json(rows);
    });
});

// 3. Download File
app.get('/download/:id', (req, res) => { // Keep as /download/ as per Nginx config
    const { id } = req.params;
    db.get(`SELECT * FROM files WHERE id = ?`, [id], (err, file) => {
        if (err || !file) {
            console.error(`File not found for download ID ${id}:`, err ? err.message : 'Not found in DB');
            return res.status(404).json({ error: 'Arquivo não encontrado.' });
        }
        // Ensure the file exists on disk before sending
        fs.access(file.path, fs.constants.R_OK, (accessErr) => {
            if (accessErr) {
                console.error(`File not accessible on disk for download ID ${id} at path ${file.path}:`, accessErr);
                return res.status(500).json({ error: 'Erro ao acessar o arquivo no disco.' });
            }
            res.download(file.path, file.original_name);
        });
    });
});

// 4. Delete File
app.delete('/api/files/:id', (req, res) => { // Changed to /api/files/:id
    const { id } = req.params;

    db.get(`SELECT * FROM files WHERE id = ?`, [id], (err, file) => {
        if (err || !file) {
            console.error(`File not found for delete ID ${id}:`, err ? err.message : 'Not found in DB');
            return res.status(404).json({ error: 'Arquivo não encontrado.' });
        }

        // Remove from disk
        fs.unlink(file.path, (unlinkErr) => {
            if (unlinkErr && unlinkErr.code !== 'ENOENT') {
                console.error(`Error deleting physical file for ID ${id} at path ${file.path}:`, unlinkErr);
                // Decide how to handle: proceed with DB delete or fail? Proceeding for now.
                // return res.status(500).json({ error: 'Erro ao deletar arquivo físico.' });
            } else if (unlinkErr && unlinkErr.code === 'ENOENT') {
                console.warn(`Physical file not found for ID ${id} at path ${file.path}. Continuing with DB delete.`);
            }

            // Remove from DB
            db.run(`DELETE FROM files WHERE id = ?`, [id], (delErr) => {
                if (delErr) {
                    console.error(`Database error deleting file ID ${id}:`, delErr.message);
                    return res.status(500).json({ error: 'Erro ao remover arquivo do banco de dados.' });
                }
                console.log(`File deleted: ${file.original_name} (ID: ${id})`);
                res.json({ message: 'Arquivo deletado com sucesso.' });
            });
        });
    });
});

// Endpoint to View file (inline)
app.get('/view/:id', (req, res) => { // Keep as /view/ as per Nginx config
    const { id } = req.params;
    db.get('SELECT * FROM files WHERE id = ?', [id], (err, file) => {
        if (err || !file) {
            console.error(`File not found for view ID ${id}:`, err ? err.message : 'Not found in DB');
            return res.status(404).json({ error: 'Arquivo não encontrado.' });
        }

        const filePath = path.resolve(file.path);
        fs.access(filePath, fs.constants.R_OK, (accessErr) => {
            if (accessErr) {
                console.error(`File not accessible on disk for view ID ${id} at path ${filePath}:`, accessErr);
                return res.status(500).json({ error: 'Erro ao acessar o arquivo no disco.' });
            }
            res.setHeader('Content-Type', file.mimetype);
            res.setHeader('Content-Disposition', 'inline');
            res.sendFile(filePath);
        });
    });
});

// **SEARCH ENDPOINT: Search Files**
app.get('/api/search', (req, res) => { // Changed to /api/search
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Parâmetro de busca "q" é obrigatório.' });
    }

    // Using LIKE for case-insensitive search on original_name
    db.all(`SELECT * FROM files WHERE LOWER(original_name) LIKE LOWER(?) ORDER BY original_name ASC`, [`%${query}%`], (err, rows) => {
        if (err) {
            console.error('Database error during search:', err.message);
            return res.status(500).json({ error: 'Erro ao realizar a busca.' });
        }
        res.json(rows);
    });
});


const server = app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Set larger timeouts for potentially large file operations
server.timeout = 0; // No request timeout
server.keepAliveTimeout = 60000; // Keep alive for 60 seconds
server.headersTimeout = 70000; // Headers timeout slightly longer than keep-alive
