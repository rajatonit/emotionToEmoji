const fetchEmotions = require('./lib/fetchEmotions');
// import tensorflowKNN from './lib/tensorflowKNN';
const emotionsToScrape =['happy person', 'sad person', 'silly person', 'relaxed person', 'suprised person', 'angry person', 'sleepy person', 'confused person', 'calm person', 'nervous person']
var finalEmotions = {}


let main = async () => {
  try {
    for await (const emotion of emotionsToScrape){
      console.log(emotion)
      const res = await fetchEmotions.fetch (emotion, 200);
      finalEmotions[emotion] = res
    }
    await fetchEmotions.save(finalEmotions,'final')

    console.log('Fetched all emotions')
    return;

  } catch (err) {
      console.log(err)
      throw(err)
  }
  // await tensorflowKNN.save ('test.json');
};

main ();
