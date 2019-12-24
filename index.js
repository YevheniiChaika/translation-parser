const parse = require("csv-parse/lib/sync")
const { convertArrayToCSV } = require("convert-array-to-csv")
const fs = require("fs")
const path = require("path")

const translationsFile = "translations.csv"
const MESSAGES_DIR = "messages"
const SOURCE_MESSAGE_KEY = "string"
const MESSAGE_KEY = "ru"

const MESSAGES = {
  // ar: [], // 'ar-ar.csv'
  da: ["da-dk.csv"],
  de: ["de-de.csv"],
  string: ["default.csv"], // todo: change this. default its 'english', not 'string'
  en: ["en-us.csv", "en-ww.csv"],
  es: ["es-es.csv"],
  fr: ["fr-fr.csv"],
  it: ["it-it.csv"],
  ja: ["ja-jp.csv"],
  ko: ["ko-kr.csv"],
  no: ["no-no.csv"],
  pl: ["pl-pl.csv"],
  pt: ["pt-pt.csv"],
  br: ["pt-br.csv"],
  ru: ["ru-ru.csv"],
  sv: ["sv-se.csv"]
}

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

const translations = readCsv(translationsFile)

const mapSourceWithTarget = ({ locales, translations, sourceKey, targetKey }) =>
  locales.map(locale => {
    const result = translations.find(
      t => t[sourceKey].toLowerCase() == locale.source.toLowerCase()
    )
    // todo: additional check for t.en == locale.source
    locale.target = result ? result[targetKey] : ""
    return locale
  })

const writeLocale = ({ fileName, translations, targetKey }) => {
  const locales = readCsv(path.join(MESSAGES_DIR, fileName))
  const result = mapSourceWithTarget({
    locales,
    translations,
    targetKey,
    sourceKey: SOURCE_MESSAGE_KEY
  })

  writeCsv(path.join("messages_results", fileName), result)
}

Object.keys(MESSAGES).forEach(targetKey => {
  if (!MESSAGES[targetKey].length) {
    return
  }

  MESSAGES[targetKey].forEach(fileName =>
    writeLocale({
      fileName,
      translations,
      targetKey
    })
  )
})

// let translation = null
// fs.readFile('translation.csv', 'utf8', function (err, contents) {
//     translation = parse(contents, {
//         columns: true,
//         skip_empty_lines: true
//     })
// })
// console.log(translation)

// fs.readdir(dir, (err, files) => {
//     files.forEach(file => {
//         // if (!file.isFile()) console.error('NOT A FILE')
//
//         console.log(file)
//     });
// });

// const languages = [
//     'string', 'en', 'fr', 'de', 'ru',
//     'es', 'pt', 'br', 'pl',
//     'it', 'ja', 'ko', 'no',
//     'sv', 'da', 'ar'
// ]

// sort
// extended check
// delete broken messages

const handleCurlyBraces = () => {
  return
}
