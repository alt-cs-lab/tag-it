const neo4j = require('neo4j-driver')

const db_host = process.env.NEO4J_HOST || 'neo'
const db_port = process.env.NEO4J_PORT || '7687'
const auth = (process.env.NEO4J_AUTH || "neo4j/neo4j").split('/')
const driver = neo4j.driver('bolt://'+db_host+':'+db_port, neo4j.auth.basic(auth[0], auth[1]))

module.exports = driver