const path = require('path');
const express = require('express');
const xss = require('xss');
const NoteService = require('./note-service');

const noteRouter = express.Router();
const jsonParser = express.json();

const serializeNote = note_table => ({
  id: note_table.id,
  name: xss(note_table.name),
  modified: note_table.modified,
  content: xss(note_table.content),
  folderId: note_table.folder_id
});

noteRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    NoteService.getNote(knexInstance).then(note_table => {
      console.log(note_table);
      res.json(note_table.map(serializeNote));
    });
  })
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { name, content, folderId } = req.body;
    const newNote = { name, content, folder_id:folderId };

    for (const [key, value] of Object.entries(newNote))
      if (value == null)
        return res.status(400).json({
          error: {
            message: `Missing ${key} in request body`
          }
        });

    NoteService.addNote(knexInstance, newNote)
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl + `/${note.id}`))
          .json(serializeNote(note));
      })
      .catch(next);
  });

noteRouter
  .route('/:note_id')
  .all((req, res, next) => {
    const knexInstance = req.app.get('db');
    NoteService.getNotebyId(knexInstance, req.params.note_id)
      .then(note_table => {
        if (!note_table) {
          return res.status(404).json({
            error: {
              message: `Note doesn't exist`
            }
          });
        }
        res.note_table = note_table;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.note_table));
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');
    NoteService.deleteNote(knexInstance, req.params.note_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { name, content, folderId } = req.body;
    const updatedNote = { name, content, folderId };

    const numberOfValues = Object.values(updatedNote).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain 'name', 'content' or 'folderId'`
        }
      });
    }

    NoteService.updateNote(knexInstance, req.params.note_id, updatedNote)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = noteRouter;