const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();

/* GET users in a project. */
router.get('/projects/:projectId/users', async (req, res) => {
  const neo4j = req.app.get('neo4j');
  const {projectId} = req.params;
  const result = await neo4j.executeRead(tx => {
    return tx.run(`
      MATCH (user:User) -[:WORKING_ON]-> (Project {projectId: $projectId})
      RETURN user;
    `, {projectId});
  });

  const users = result.records.map(row => row.get('user').properties);

  res.render('./users-list', {users});
});


/* POST add user to project */
router.post('/projects/:projectId/users', bodyParser.urlencoded({extended: false}), async (req, res) => {
  const neo4j = req.app.get('neo4j');
  const {username} = req.body;
  const {projectId} = req.params;
  const result = await neo4j.executeWrite(tx => {
    tx.run(`
      MATCH (project:Project {projectId: $projectId})
      MERGE (user:User {username: $username}) -[:WORKING_ON {role: 'collaborator'}]-> (project);
      `, {username, projectId});
  });
  res.redirect(`/projects/${projectId}/users`);
})

module.exports = router;
