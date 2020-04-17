const app = require('./app')
const app = require('knex')

const {PORT,DATABASE_URL} = require('./config');


const { PORT, DATABASE_URL } = require('./config')

  const db = knex({
    client: 'pg',

  connection: DATABASE_URL,
  })
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})