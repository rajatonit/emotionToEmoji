const tensorflowKNN = require ('./lib/tensorflowKNN');
const fetchEmotions = require ('./lib/fetchEmotions');
const emotionsToScrape = {
  'happy person': 'happy',
  'sad person': 'sad',
  'laughing person': 'laugh',
  'netural person': 'netural',
};
const emotionCorrectness = {}

let main = async () => {
  try {
    await tensorflowKNN.loadModel ('final_emotions_model.json');

    let emotionData = await fetchEmotions.read ('final');
    for await (const emotion of Object.keys (emotionData)) {
      emotionCorrectness[emotion] = {
        true: 0, // times right
        false: 0 //times wrong
      }
      console.log ('testing ' + emotion);
      const emotionsReturned = await tensorflowKNN.returnEmotion (
        emotionsToScrape[emotion],
        emotionData[emotion].slice (0, 20).join(emotionData[emotion].slice (100, 150))
      );
      for await (const guessEmotion of tensorflowKNN.returnGuessedEmotions()){
        if(guessEmotion.label === emotionsToScrape[emotion]){
          emotionCorrectness[emotion].true +=1
        }else{
          emotionCorrectness[emotion].false +=1
        }
      }
    }

    Object.keys(emotionCorrectness).forEach(emotion=>{
      const currentEmotionResults = emotionCorrectness[emotion]
      const currentEmotionResultsTotal = emotionCorrectness[emotion].true + emotionCorrectness[emotion].false
      console.log("-------------------------------")
      console.log(emotion + " Results: ")
      console.log('Emotion was false ' + (currentEmotionResults.false / currentEmotionResultsTotal)* 100 + "%")
      console.log('Emotion was true ' + (currentEmotionResults.true / currentEmotionResultsTotal)* 100 + "%")
      console.log("-------------------------------")
    })



    console.log ('Tested all emotions');
    return;
  } catch (err) {
    console.log (err);
    throw err;
  }
};

main ();
