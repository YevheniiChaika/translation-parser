const path = require("path")
// const { translationMapToLocaleFile } = require("./constants")
// todo: it is mocked while in testing
const translationMapToLocaleFile = {
  da: ["da-dk.csv"],
  string: ["default.csv"],
  en: ["en-us.csv"],
  ru: ["ru-ru.csv"],
  pt: ["pt-pt.csv"]
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

/**
 * @param message
 * @param logs
 * @param translationElement
 */
function tryAssignNewMessage({ message, logs, translationElement }) {
  const messageTarget = message.target
  if (messageTarget) {
    logs.incHasValue()
    if (messageTarget === translationElement) {
      logs.incSameValue()
    } else {
      logs.addDifferentValues({
        fromMessage: messageTarget,
        fromTranslation: translationElement
      })
    }
  } else {
    logs.incHasNoValue()
    message.target = fixBraces(translationElement)
  }
}

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
    const enLang = "en"
    const messageTranslation = translations.find(
      t =>
        prepStr(message.source) === prepStr(fixBraces(t[sourceKey])) ||
        prepStr(message.source) === prepStr(fixBraces(t[enLang]))
    )
    if (messageTranslation) {
      logs.incTranslations()
      tryAssignNewMessage({
        message: message,
        logs: logs,
        translationElement: messageTranslation[targetKey]
      })
    } else {
      const messageTranslationCaseInsensitive = translations.find(
        t =>
          prepStrCaseInsensitive(message.source) ===
            prepStrCaseInsensitive(fixBraces(t[sourceKey])) ||
          prepStrCaseInsensitive(message.source) ===
            prepStrCaseInsensitive(fixBraces(t[enLang]))
      )
      if (messageTranslationCaseInsensitive) {
        logs.incTranslations()
        logs.incTranslationsCaseInsensitive()
        tryAssignNewMessage({
          message: message,
          logs: logs,
          translationElement: messageTranslationCaseInsensitive[targetKey]
        })
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

//todo: create 'build' and ? 'input' dir
