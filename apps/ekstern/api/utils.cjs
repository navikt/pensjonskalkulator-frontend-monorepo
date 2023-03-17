// Kan brukes hvis man vil simulere treg responstid
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = {
  sleep,
}
