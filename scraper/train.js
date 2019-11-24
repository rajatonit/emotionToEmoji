const fetchEmotions = require ('./lib/fetchEmotions');
const tensorflowKNN = require ('./lib/tensorflowKNN');

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
  try {
    let emotionData = await fetchEmotions.read ('final');
    for await (const emotion of Object.keys (emotionData)) {
      console.log ('training ' + emotion);
      await tensorflowKNN.addEmotion (
        emotionsToScrape[emotion],
        emotionData[emotion].slice (0, 150)
      );
    }
    await tensorflowKNN.save ('final_emotions_model.json');

    // await fetchEmotions.save(finalEmotions,'final')

    console.log ('Fetched all emotions');
    return;
  } catch (err) {
    console.log (err);
    throw err;
  }
  // await tensorflowKNN.save ('test.json');
};

main ();
