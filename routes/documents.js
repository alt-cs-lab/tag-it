const fs = require('fs/promises');
const path = require('path');
const express = require('express');
const router = express.Router();
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const parseFile = require('../helpers/parseFile');
const { fstat } = require('fs');
const { Neo4jError } = require('neo4j-driver');
const session = require('express-session');

/* GET document */
router.get('/projects/:projectId/documents/:documentId', async function(req, res) {
  const neo4j = req.app.get('neo4j');
  const {projectId, documentId} = req.params;
  const {username} = req.session;

  // Get the document 
  var {records} = await neo4j.executeRead(async tx => {
    return tx.run(`
      MATCH (doc:Document {documentId: $documentId})
      RETURN doc;
    `, { documentId });
  });
  if(records.length == 0) return res.status(404);

  const doc = records[0].get('doc').properties;

  // Get all codes used in the project
  var {records} = await neo4j.executeRead(async tx => {
    return tx.run(`
      MATCH (project:Project {projectId:$projectId})
      MATCH (doc:Document) -[:BELONGS_TO]-> (project)
      MATCH (code)<-[:TAGGED]-(doc)
      return code;
    `,{projectId});
  });

  const codes = records.map(row => row.get('code').properties.name);

  res.render('documents-show', { ...doc, codes, projectId, username });
});

/* POST document */
router.post('/projects/:projectId/documents', upload.array("files"), async function(req, res) {
  const neo4j = req.app.get('neo4j');
  const {projectId} = req.params;
  const {username} = req.session;

  // Begin a database transaction
  const tx = neo4j.beginTransaction();

  // Process uploaded files
  await Promise.all(req.files.map(async file => {

      // Parse the uploaded file
      let parsedFiles = await parseFile(file.originalname, file.path);

      // We recieve a collection of parsed files, so handle each one separately
      await Promise.all(parsedFiles.map(async ({filename, text}) => {
    
        // Add the document to the database
        await tx.run(`
          MATCH (p:Project {projectId: $projectId})
          MATCH (u:User {username: $username})
          CREATE (d:Document {documentId: randomuuid(), createdDate: datetime(), filename: $filename, text: $text})
          MERGE (d)-[r1:BELONGS_TO]->(p)
          MERGE (d)-[r2:UPLOADED_BY]->(u)
        `, 
        { username, projectId, filename, text }
       );
        
      }));

      // Delete the uploaded file
      await fs.unlink(file.path);
  }));

  await tx.commit();

  res.redirect(`/projects/${projectId}`);
});

module.exports = router;
