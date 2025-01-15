const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();

/* GET users in a project. */
router.get('/projects/:projectId/users', async (req, res) => {
  const neo4j = req.app.get('neo4j');
  const {projectId} = req.params;
  const result = await neo4j.executeQuery(`
    MATCH (user:User) -[:WORKING_ON]-> (Project {projectId: $projectId})
    RETURN user;
  `, {projectId});

  const users = result.records.map(row => row.get('user').properties);

  res.json(users);
});


/* POST add user to project */
router.post('/projects/:projectId/users', bodyParser.urlencoded({extended: false}), async (req, res) => {
  const neo4j = req.app.get('neo4j');
  const {usernames} = req.body;
  const {projectId} = req.params;
  const result = await neo4j.executeQuery(`
    MATCH (project:Project {projectId: $projectId})
    UNWIND $usernames AS username
    MERGE (user:User {username: username}) -[:WORKING_ON {role: 'collaborator'}]-> (project);
  `, {usernames, projectId});
//   const result = await neo4j.executeQuery(`
//     MATCH (project:Project {projectId: $projectId})
//     MERGE (user:User {username: $username}) -[:WORKING_ON {role: 'collaborator'}]-> (project);
// `, {username, projectId})  
  res.sendStatus(200)
})

module.exports = router;
