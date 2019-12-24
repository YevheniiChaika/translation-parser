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

const mapSourceWithTarget = ({
  locale,
  translations,
  sourceKey,
  targetKey
}) => {
  const localeLog = {
    localeName: targetKey,
    messagesNum: 0,
    foundedMessagesNum: 0
  }
  const newLocale = locale.map(message => {
    ++localeLog.messagesNum
    const messageTranslation = translations.find(
      t => t[sourceKey].toLowerCase() == message.source.toLowerCase()
    )
    // todo: maybe add additional check for t.en == message.source
    // todo: this approach removes filled message if they are not found in translations file
    if (messageTranslation) {
      ++localeLog.foundedMessagesNum
      message.target = messageTranslation[targetKey]
    }
    return message
  })
  console.log("localeLog", localeLog)

  return newLocale
}

//todo: add an option to skip messages that are already filled
//todo: find out duplicates

const writeLocale = ({ fileName, translations, targetKey }) => {
  const locale = readCsv(path.join(MESSAGES_DIR, fileName))
  const newLocale = mapSourceWithTarget({
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
    writeLocale({
      fileName,
      translations,
      targetKey
    })
  )
})
