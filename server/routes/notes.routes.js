const express = require('express');
const router = express.Router();
const {
  createNote,
  getNotes,
  getNotesSummary,
  getNoteById,
  updateNote,
  deleteNote,
  toggleNotePin,
} = require('../controllers/notes.controller');
const authMiddleware = require('../middleware/authMiddleware');

// All notes routes require JWT authentication
router.use(authMiddleware);

// GET /api/notes/summary (Must come before /:id)
router.get('/summary', getNotesSummary);

// GET /api/notes
router.get('/', getNotes);

// POST /api/notes
router.post('/', createNote);

// GET /api/notes/:id
router.get('/:id', getNoteById);

// PUT /api/notes/:id
router.put('/:id', updateNote);

// DELETE /api/notes/:id
router.delete('/:id', deleteNote);

// PATCH /api/notes/:id/pin
router.patch('/:id/pin', toggleNotePin);

module.exports = router;
