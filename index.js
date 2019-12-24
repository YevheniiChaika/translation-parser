const parse = require("csv-parse/lib/sync")
const { convertArrayToCSV } = require("convert-array-to-csv")
const fs = require("fs")
const path = require("path")
const { translationMapToLocaleFile } = require("./constants")

// config
const translationsFile = "translations.csv"
const MESSAGES_DIR = "messages"
const SOURCE_MESSAGE_KEY = "string"

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

const prepStr = str => str.toLowerCase().trim()

//todo: rename mb
const getNewLocaleFile = ({ locale, translations, sourceKey, targetKey }) => {
  //todo: made OOP
  const localeLog = {
    locale: targetKey,
    messages: 0,
    translations: 0,
    hasValue: 0,
    hasNoValue: 0,
    hasNoLocation: 0,
    sameValue: 0,
    differentValues: []
  }
  const newLocale = locale.map(message => {
    ++localeLog.messages
    if (!message.location) ++localeLog.hasNoLocation

    const messageTranslation = translations.find(
      t => prepStr(t[sourceKey]) === prepStr(message.source)
    )
    if (messageTranslation) {
      ++localeLog.translations
      if (message.target) {
        ++localeLog.hasValue
        if (message.target === messageTranslation[targetKey]) {
          ++localeLog.sameValue
        } else {
          localeLog.differentValues.push({
            fromMessage: message.target,
            fromTranslation: messageTranslation[targetKey]
          })
        }
      } else {
        ++localeLog.hasNoValue
        message.target = messageTranslation[targetKey]
      }
    }
    return message
  })
  console.log(localeLog)
  return newLocale
}

const writeLocale = ({ fileName, translations, targetKey }) => {
  let locale = readCsv(path.join(MESSAGES_DIR, fileName))
  // to clear broken messages with empty 'location'
  locale = locale.filter(m => m.location)
  const newLocale = getNewLocaleFile({
    locale,
    translations,
    sourceKey: SOURCE_MESSAGE_KEY,
    targetKey
  })
  writeCsv(path.join("messages_results", fileName), newLocale)
}

const translations = readCsv(translationsFile)

Object.keys(translationMapToLocaleFile).forEach(targetKey => {
  if (!translationMapToLocaleFile[targetKey].length) {
    return
  }

  translationMapToLocaleFile[targetKey].forEach(fileName =>
    writeLocale({ fileName, translations, targetKey })
  )
})

//todo: curly braces transformation {{{*}}} -> {*}, {{*}} -> {*}
//todo: checks: 1. Case sensitive 2. Case insensitive
//todo: find how many duplicates
//todo: create 'build' and ?'input' dir
