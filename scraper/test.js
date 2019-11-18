const tensorflowKNN = require ('./lib/tensorflowKNN');
const fetchEmotions = require ('./lib/fetchEmotions');
const emotionsToScrape = {
  'happy person': 'happy',
  'sad person': 'sad',
  'laughing person': 'laugh',
  'netural person': 'netural',
};

let main = async () => {
  try {
    await tensorflowKNN.loadModel ('final_emotions.json');

    let emotionData = await fetchEmotions.read ('final');
    for await (const emotion of Object.keys (emotionData)) {
      console.log ('testing ' + emotion);
      const emotionsReturned = await tensorflowKNN.returnEmotion (
        emotionsToScrape[emotion],
        emotionData[emotion].slice (0, 10)
      );
      console.log (emotionsReturned);
    }

    console.log ('Fetched all emotions');
    return;
  } catch (err) {
    console.log (err);
    throw err;
  }
};

main ();
