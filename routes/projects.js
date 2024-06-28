const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

/* GET projects listing. */
router.get('/', async function(req, res, next) {
  const neo4j = req.app.get('neo4j');
  const {username} = req.session;

  // Get the user's projects
  var result = await neo4j.executeRead(tx => {
    return tx.run(`
      MATCH (p:Project) <-[:WORKING_ON]- (User {username:$username}) 
      RETURN p.name AS name, p.projectId AS projectId;
    `, {username});
  });
  var projects = result.records.map(row => row.toObject());
  
  res.render('projects-list.ejs', {projects});
});

/* GET specific project. */
router.get('/:projectId', async function(req, res, next) {
  const neo4j = req.app.get('neo4j');
  const {projectId} = req.params;
  const {username} = req.session;
  const {records, summary} = await neo4j.executeRead(async tx => {
    //return tx.run('MATCH (p:Project) WHERE p.projectId = $projectId RETURN p.name AS name, p.projectId AS projectId LIMIT 1', {projectId});
    return tx.run(`
        MATCH (p:Project {projectId: $projectId})
        MATCH (d:Document)-[BELONGS_TO]->(p) 
        RETURN p,d;
      `,
      { projectId }
    )
  });

  if(records.length == 0) return res.sendStatus(404);

  // Extract project data from result 
  let project = records[0].get('p').properties;
  
  // Add document data to project
  project.documents = [];
  records.forEach(record => {
    let doc = record.get('d');
    project.documents.push(doc.properties);
  });

  res.render('projects-show', {username, project});
})

/* CREATE new project. */
router.post('/', bodyParser.urlencoded({extended: false}), async function(req, res) {
  const neo4j = req.app.get('neo4j');
  const {username} = req.session;
  const {name} = req.body;
  const projectId = uuidv4();
  const result = await neo4j.executeWrite(tx => {
    tx.run(`
      MATCH (user:User {username: $username})
      CREATE(project: Project{name: $name, projectId: $projectId}),
      (user) -[:WORKING_ON {role: 'owner'}]-> (project);
      `, {username, name, projectId});
  });
  res.redirect(`projects/${projectId}`);
})

module.exports = router;
