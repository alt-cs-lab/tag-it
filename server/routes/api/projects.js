/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Projects API
 */

// Load libraries
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

// Load Configurations
const requestLogger = require('../../middleware/request-logger')

// Configure Logging
router.use(requestLogger)

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     summary: list all the projects 
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: the list of all projects available to the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get('/projects/', async function(req, res, next) {
  const neo4j = req.app.get('neo4j');
  const {username} = req.session;

  // Get the user's projects
  var result = await neo4j.executeQuery(`
    MATCH (p:Project) <-[:WORKING_ON]- (User {username:$username}) 
    RETURN p.name AS name, p.projectId AS projectId;
  `, {username});
  var projects = result.records.map(row => row.toObject());
  
  res.json(projects);
});

/* GET specific project. */
router.get('/projects/:projectId', async function(req, res, next) {
  const neo4j = req.app.get('neo4j');
  const {projectId} = req.params;
  const {username} = req.session;
  const {records, summary} = await neo4j.executeQuery(
    //return tx.run('MATCH (p:Project) WHERE p.projectId = $projectId RETURN p.name AS name, p.projectId AS projectId LIMIT 1', {projectId});
    `
      MATCH (p:Project {projectId: $projectId}) 
      RETURN p AS project, 
        COLLECT {
          MATCH (d:Document)-[:BELONGS_TO]->(p)
          RETURN d
        } AS documents,
        COLLECT {
            MATCH (u:User) -[:WORKING_ON]->(p)
            RETURN u
        } AS users;
    `,
    { projectId }
  );
  
  if(records.length == 0) return res.sendStatus(404);

  // Extract project data from result 
  let project = records[0].get('project').properties;
  project.documents = records[0].get('documents').map(d => d.properties);
  project.users = records[0].get('users').map(u => u.properties);

  res.json(project)
  /*
  // Add document data to project
  project.documents = [];
  records.forEach(record => {
    let doc = record.get('d');
    project.documents.push(doc.properties);
  });
*/
  //res.render('projects-show', {username, project});
})

/* CREATE new project. */
router.post('/projects/', bodyParser.urlencoded({extended: false}), async function(req, res) {
  const neo4j = req.app.get('neo4j');
  const {username} = req.session;
  const {name} = req.body;
  const projectId = uuidv4();
  const result = await neo4j.executeQuery(`
    MATCH (user:User {username: $username})
    CREATE(project: Project{name: $name, projectId: $projectId}),
    (user) -[:WORKING_ON {role: 'owner'}]-> (project);
    `, {username, name, projectId});
  res.redirect(`projects/${projectId}`);
})

module.exports = router;
