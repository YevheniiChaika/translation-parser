const parse = require("csv-parse/lib/sync")
const { convertArrayToCSV } = require("convert-array-to-csv")
const fs = require("fs")

const readCsv = path => {
  const contents = fs.readFileSync(path, "utf8")
  return parse(contents, {
    columns: true,
    skip_empty_lines: true
  })
}

const writeCsv = (path, content) => {
  const csv = convertArrayToCSV(content)
  fs.writeFileSync(path, csv, "utf8")
}

const prepStr = str => str.trim()
const prepStrCaseInsensitive = str => str.toLowerCase().trim()

const regex = /{{{?(.*?)}}}?/gm

function replacer(match, p1) {
  return `{${p1}}`
}

function fixBraces(str) {
  return str.replace(regex, replacer)
}

module.exports = { replaceCurlyBraces }

module.exports = {
  readCsv,
  writeCsv,
  prepStr,
  prepStrCaseInsensitive,
  fixBraces
}
