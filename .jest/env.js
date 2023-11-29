const fs = require('fs')

module.exports = function () {
  const env = fs.readFileSync('.env', 'utf8').toString()
  const lines = env.split('\n')
  lines.forEach((line) => {
    const [key, value] = line.split('=')
    process.env[key] = value
  })
}
