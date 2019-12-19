const fetchEmotions = require ('./lib/fetchEmotions');
const tensorflowKNN = require ('./lib/tensorflowKNN');
const Logger = require('./logger/logger')

const emotionsToScrape = {
  'happy person': 'happy',
  'silly person': 'silly',
  'relaxed person': 'relaxed',
  'suprised person': 'suprised',
  'angry person': 'angry',
  'sleepy person': 'sleepy',
  'confused person' : 'confused',
  'calm person' : 'calm',
  'nervous person' : 'nervous',
};
var finalEmotions = {};

let main = async () => {
  const log = new Logger('info').getLog()
  try {
    log.info('Starting training of data on: ', new Date().toJSON())
    let emotionData = await fetchEmotions.read ('final');
    for await (const emotion of Object.keys (emotionData)) {
      log.info('Starting training of emotion',  emotion , ' on: ', new Date().toJSON())
      await tensorflowKNN.addEmotion (
        emotionsToScrape[emotion],
        emotionData[emotion].slice (0, 150),
        log
      );
      log.info('Finished training of emotion',  emotion , ' on: ', new Date().toJSON())
    }
    await tensorflowKNN.save ('final_emotions_model.json', log);

    // await fetchEmotions.save(finalEmotions,'final')

    log.info('Finished training of data on: ', new Date().toJSON())
    return;
  } catch (err) {
    log.error('Error on training of data ', err , ' ', new Date().toJSON())
    throw err;
  }
  // await tensorflowKNN.save ('test.json');
};

main ();
