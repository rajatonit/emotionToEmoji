const fetchEmotions = require ('./lib/fetchEmotions');
// import tensorflowKNN from './lib/tensorflowKNN';
const emotionsToScrape = [
  'happy person',
  'sad person',
  'silly person',
  'relaxed person',
  'suprised person',
  'angry person',
  'sleepy person',
  'confused person',
  'calm person',
  'nervous person',
];
var finalEmotions = {};
const Logger = require ('./logger/logger');

let main = async () => {
  try {
    const log = new Logger ('info').getLog ();

    log.info ('Scraping Emotions on ', new Date ().toJSON ());

    for await (const emotion of emotionsToScrape) {
      const res = await fetchEmotions.fetch (emotion, 200, log);
      finalEmotions[emotion] = res;
    }
    await fetchEmotions.save (finalEmotions, 'final');

    log.info ('Finished scraping Emotions on ', new Date ().toJSON ());
    return;
  } catch (err) {
    log.error ('Error scraping emotions ', err, ' ', new Date ().toJSON ());
    // console.log(err)
    throw err;
  }
  // await tensorflowKNN.save ('test.json');
};

main ();
