# Backend Initialization Walkthrough

The backend for the LocalDrive project has been successfully initialized and verified.

## Changes Made

### Project Setup

- Initialized Node.js project in `backend/`
- Installed dependencies: `express`, `multer`, `sqlite3`, `cors`, `dotenv`, `nodemon`
- Configured scripts in `package.json`

### Database

- Created `src/database/database.js` to handle SQLite connection
- Automatically creates a `files` table for storing metadata

### Server

- Implemented `src/server.js` with the following features:
  - **CORS Support:** Enabled for frontend integration
  - **File Upload:** Managed via Multer, saving files to `backend/uploads/`
  - **REST API Endpoints:**
    - `POST /upload`: Uploads a file and records metadata
    - `GET /files`: Lists all uploaded files
    - `GET /download/:id`: Downloads a specific file
    - `DELETE /files/:id`: Deletes a file from disk and database

## Verification Results

### Server Startup

The server starts correctly using `npm run dev` and connects to the SQLite database.

### API Functionality

Verified the endpoints using `curl`:

1. **Upload:** Successfully uploaded a test file.
2. **List:** Verified the file appearing in the list.
3. **Delete:** Verified the file removal from both disk and database.

```bash
# Example test run
curl -F "file=@test.txt" http://localhost:3001/upload
curl http://localhost:3001/files
```

## Next Steps

- Implement the Frontend to consume these API endpoints.
- Add file preview functionality.
