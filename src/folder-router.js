const path = require('path');
const express = require('express');
const xss = require('xss');
const FolderService = require('./folder-service');

const folderRouter=express.Router();
const jsonParser=express.json();

const serializeFolder = folder_table => ({
    id: folder_table.id,
    name: xss(folder_table.name)
});

folderRouter
.route('/')
.get((req,res,next)=>{
    const knexInstance=req.app.get('db');
    FolderService.getFolder(knexInstance)
    .then(folder_table =>{
        res.json(folder_table)
    })
    .catch(next);
})
.post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        error: {
          message: 'Missing name in request body'
        }
      });
    }

    const newFolder = {
      name
    };

    FolderService.addFolder(knexInstance, newFolder).then(folder_table =>
      res
        .status(201)
        .location(path.posix.join(req.originalUrl + `/${folder_table.id}`))
        .json(serializeFolder(folder_table))
    );
  });

folderRouter
  .route('/:folderId')
  .all((req, res, next) => {
    const knexInstance = req.app.get('db');
    FolderService.getById(knexInstance, req.params.folderId)
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: {
              message: `Folder doesn't exist`
            }
          });
        }
        res.folder_table = folder_table;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeFolder(res.folder_table));
  })
  .delete((req, res, next) => {
    FolderService.deleteFolder(req.app.get('db'), req.params.folderId)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        error: {
          message: `Request body must contain 'name'`
        }
      });
    }

    FolderService.updateFolder(knexInstance, req.params.folderId, { name })
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = folderRouter;

































