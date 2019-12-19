module.exports = class Logger {
  constructor (level = 'info') {
    if (Logger.instance) {
      return Logger.instance;
    }

    Logger.instance = this;

    this.log = require ('simple-node-logger').createSimpleLogger ();
    this.setLevel (level);

    return this;
  }

  getLog () {
    return this.log;
  }
};
