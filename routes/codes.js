const express = require('express');
const bodyParser = require('body-parser');
const { stringify } = require('uuid');

const router = express.Router();

/* GET codes for document */
router.get('/projects/:projectId/documents/:documentId/codes', async function(req, res) {
    const neo4j = req.app.get('neo4j');
    const {username} = req.session;
    const {projectId, documentId} = req.params;
    let result;
    if(false) { //TODO: Add reconcilliation mode}
      // Retrieve all codes in the document
      result = await neo4j.executeRead(tx => {
          return tx.run(`
              MATCH (Document {documentId: $documentId}) -[tag:TAGGED]-> (code:Code)
              RETURN tag.tagId AS tagId, tag.start AS start, tag.end as end, tag.text AS text, code.name AS name, tag.by AS username;
          `, {documentId});
      })
    } else {
      // Retrieve all codes in the document created by the current user
      result = await neo4j.executeRead(tx => {
        return tx.run(`
            MATCH (Document {documentId: $documentId}) -[tag:TAGGED {by: $username}]-> (code:Code)
            RETURN tag.tagId AS tagId, tag.start AS start, tag.end as end, tag.text AS text, code.name AS name, tag.by AS username;
        `, {documentId, username});
      })
    }
    // Package the codes as annotations
    const annotations = result.records.map(row => {
        let tagId = row.get('tagId');
        let start = row.get('start');
        let end = row.get('end');
        let value = row.get('name');
        let text = row.get('text');
        let username = row.get('username');
        return {
            "@context":"http://www.w3.org/ns/anno.jsonld",
            "type":"Annotation",
            "id": tagId,
            "body":[{
                "type": "TextualBody",
                "value": value,
                "purpose": "tagging" 
            }],
            "target": {
                "selector": [
                    {"type":"TextQuoteSelector","exact":text},
                    {"type":"TextPositionSelector","start":start,"end":end}
                ]
            },
            "creator": {
                id: `http://k-state.edu/${username}`,
                name: username
            }
        }
    })
    res.json(annotations);
});

function annotationToRange(annotation) {

}

/* POST new code for document */
router.post('/projects/:projectId/documents/:documentId/codes', bodyParser.json(), async function(req, res) {
  const neo4j = req.app.get('neo4j');
  const {username} = req.session;
  const annotation = req.body;
  const {projectId, documentId} = req.params;  

  // Extract annotation information
  let code, start, end, text;  
  annotation.body.forEach(body => {
    if(body.type === "TextualBody") code = body.value;
  });
  annotation.target.selector.forEach(selector => {
    if(selector.type === "TextQuoteSelector") text = selector.exact;
    if(selector.type === "TextPositionSelector") {start = selector.start; end = selector.end }
  });

  // Create our tag
  const result = await neo4j.executeWrite(tx => {  
    return tx.run(`
      MATCH (user:User {username: $username})
      MATCH (document:Document {documentId: $documentId})      
      MERGE (code: Code{name: $code, projectId: $projectId})
      CREATE (document) -[tag:TAGGED {tagId: randomuuid(), start: $start, end: $end, by: $username, text: $text}]-> (code)
      RETURN tag.tagId AS tagId;      
    `, {username, code, projectId, documentId, start, end, text});
  });

  if(result.records == 0) return res.status(500);

  const tagId = result.records[0].get('tagId')
  res.json(tagId);

  //res.redirect(`/projects/${projectId}/documents/${documentId}`);
});

/* UPDATE code tagging for document */
router.patch('/projects/:projectId/documents/:documentId/codes', bodyParser.json(), async function(req, res) {
  const neo4j = req.app.get('neo4j');
  const {username} = req.session;
  const annotation = req.body;
  const tagId = annotation.id;

  // Extract annotation information
  let code, start, end, text;  
  annotation.body.forEach(body => {
    if(body.type === "TextualBody") code = body.value;
  });
  annotation.target.selector.forEach(selector => {
    if(selector.type === "TextQuoteSelector") text = selector.exact;
    if(selector.type === "TextPositionSelector") {start = selector.start; end = selector.end }
  });
  
  // Update our tag 
  const result = await neo4j.executeWrite(tx => {
    return tx.run(`
      MERGE (Code)-[tag:TAGGED {tagId: $tagId, code: $code}]->(Document)
      DELETE tag;
    `, {tagId, code})
  });
  
  res.status(200);
});
  

/* DELETE code tagging for document */
router.delete('/projects/:projectId/documents/:documentId/codes', bodyParser.json(), async function(req, res) {
  const neo4j = req.app.get('neo4j');
  const {username} = req.session;
  const annotation = req.body;
  const tagId = annotation.id;

  // Remove our tag 
  const result = await neo4j.executeWrite(tx => {
    return tx.run(`
      MATCH (Code)-[tag:TAGGED {tagId: $tagId}]->(Document)
      DELETE tag;
    `, {tagId})
  });

  res.status(200);
});

module.exports = router;