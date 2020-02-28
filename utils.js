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

const prepStr = str => fixSpaces(removeTag(str)).trim()
const prepStrCaseInsensitive = str => prepStr(str).toLowerCase()

const regexBraces = /{{{?(.*?)}}}?/gm
// const regexBraces2 = /{{2,}([^}]+)}{2,}?/gm
const regexTag = /\s*<[^>]*>\s*/gm
const regexSpaces = /\s{2,}/gm
const regexVariable = /{+[^}]*}+/gm

function replacer(match, p1) {
  return `{${p1}}`
}

function fixBraces(str) {
  return str.replace(regexBraces, replacer)
}

// function removeVariables (str) {
//   return str.replace(regexVariable, '')
// }

const spaceChar = " "

function removeTag(str) {
  return str.replace(regexTag, spaceChar)
}

function replaceApostrophe(str) {
  return str.replace("’", "'")
}

function compareStringsWithoutTags(str1, str2) {
  return removeTag(str1) === removeTag(str2)
}

function fixSpaces(str) {
  return str.replace(regexSpaces, spaceChar)
}

module.exports = {
  readCsv,
  writeCsv,
  prepStr,
  prepStrCaseInsensitive,
  fixBraces
}
