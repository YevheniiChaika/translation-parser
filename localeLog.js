function LocaleLog(locale) {
  this.locale = locale
  this.messages = 0
  this.translations = 0
  this.translationsCaseInsensitive = 0
  this.hasValue = 0
  this.hasNoValue = 0
  this.hasNoLocation = 0
  this.sameValue = 0
  this.differentValues = []

  this.increment = function(prop) {
    ++this[prop]
  }

  this.incMessages = function() {
    this.increment("messages")
  }
  this.incTranslations = function() {
    this.increment("translations")
  }
  this.incTranslationsCaseInsensitive = function() {
    this.increment("translationsCaseInsensitive")
  }
  this.incHasValue = function() {
    this.increment("hasValue")
  }
  this.incHasNoValue = function() {
    this.increment("hasNoValue")
  }
  this.incHasNoLocation = function() {
    this.increment("hasNoLocation")
  }
  this.incSameValue = function() {
    this.increment("sameValue")
  }
  this.addDifferentValues = function(value) {
    this.differentValues.push(value)
  }
  this.show = function(showDifs) {
    console.log(this.locale.toUpperCase())
    console.table({
      messages: this.messages,
      translations: this.translations,
      transCaseIns: this.translationsCaseInsensitive,
      hasValue: this.hasValue,
      hasNoValue: this.hasNoValue,
      sameValue: this.sameValue,
      hasNoLocation: this.hasNoLocation
    })
    showDifs && console.log(...this.differentValues)
  }
}

module.exports = { LocaleLog }
