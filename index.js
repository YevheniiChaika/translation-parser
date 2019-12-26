const path = require("path")
// const { translationMapToLocaleFile } = require("./constants") // todo: it is mocked while in testing
const translationMapToLocaleFile = {
  da: ["da-dk.csv"],
  string: ["default.csv"], // todo: change this. default its 'english', not 'string'
  en: ["en-us.csv"],
  ru: ["ru-ru.csv"]
}
const {
  translationsFile,
  MESSAGES_DIR,
  SOURCE_MESSAGE_KEY
} = require("./config")
const {
  readCsv,
  writeCsv,
  prepStr,
  prepStrCaseInsensitive,
  fixBraces
} = require("./utils")
const { LocaleLog } = require("./localeLog")

const getNewLocaleFile = ({
  locale,
  translations,
  sourceKey,
  targetKey,
  fileName
}) => {
  const logs = new LocaleLog(fileName + " <- " + targetKey)

  const newLocale = locale.map(message => {
    logs.incMessages()
    if (!message.location) {
      ++localeLog.hasNoLocation
    }

    // case sensitive check
    const messageTranslation = translations.find(
      t => prepStr(message.source) === prepStr(fixBraces(t[sourceKey]))
    )
    if (messageTranslation) {
      logs.incTranslations()
      if (message.target) {
        logs.incHasValue()
        if (message.target === messageTranslation[targetKey]) {
          logs.incSameValue()
        } else {
          logs.addDifferentValues({
            fromMessage: message.target,
            fromTranslation: messageTranslation[targetKey]
          })
        }
      } else {
        logs.incHasNoValue()
        message.target = messageTranslation[targetKey]
      }
    } else {
      const messageTranslationCaseInsensitive = translations.find(
        t =>
          prepStrCaseInsensitive(message.source) ===
          prepStrCaseInsensitive(fixBraces(t[sourceKey]))
      )
      if (messageTranslationCaseInsensitive) {
        logs.incTranslations()
        logs.incTranslationsCaseInsensitive()
        if (message.target) {
          logs.incHasValue()
          if (message.target === messageTranslationCaseInsensitive[targetKey]) {
            logs.incSameValue()
          } else {
            logs.addDifferentValues({
              fromMessage: message.target,
              fromTranslation: messageTranslationCaseInsensitive[targetKey]
            })
          }
        } else {
          logs.incHasNoValue()
          message.target = messageTranslationCaseInsensitive[targetKey]
        }
      }
    }
    return message
  })
  logs.show()
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
    targetKey,
    fileName
  })
  writeCsv(path.join("messages_results", fileName), newLocale)
}

const translations = readCsv(translationsFile)

Object.keys(translationMapToLocaleFile).forEach(targetKey => {
  if (translationMapToLocaleFile[targetKey].length) {
    translationMapToLocaleFile[targetKey].forEach(fileName =>
      writeLocale({ fileName, translations, targetKey })
    )
  }
})

//todo: curly braces transformation {{{*}}} -> {*}, {{*}} -> {*}
// ---- also in checks
const regex = /{{{?(.*?)}}}?/gm
function replacer(match, p1, offset, string) {
  return `{${p1}}`
}
const string =
  "Billed as one payment of {{{currencyAndPrice}}} {{currencyAndPrice}} every 36 months"
const newString = string.replace(regex, replacer)
console.log(newString)
//todo: checks: 1. Case sensitive 2. Case insensitive
//todo: find how many duplicates
//todo: create 'build' and ?'input' dir
