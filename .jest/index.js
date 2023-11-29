try {
  const setup = require('./env.js')
  if (setup) setup()
} catch (err) {
  console.error(err)
}
