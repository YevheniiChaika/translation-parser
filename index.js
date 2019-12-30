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
      ++logs.hasNoLocation
    }

    // case sensitive check
    const messageTranslation = translations.find(
      t =>
        prepStr(message.source) === prepStr(fixBraces(t[sourceKey])) ||
        prepStr(message.source) === prepStr(fixBraces(t["en"]))
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
        message.target = fixBraces(messageTranslation[targetKey])
      }
    } else {
      const messageTranslationCaseInsensitive = translations.find(
        t =>
          prepStrCaseInsensitive(message.source) ===
            prepStrCaseInsensitive(fixBraces(t[sourceKey])) ||
          prepStrCaseInsensitive(message.source) ===
            prepStrCaseInsensitive(fixBraces(t["en"]))
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
          message.target = fixBraces(
            messageTranslationCaseInsensitive[targetKey]
          )
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

//todo: create 'build' and ?'input' dir
//todo: html tags corrections
