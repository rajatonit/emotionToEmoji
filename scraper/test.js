const tensorflowKNN = require ('./lib/tensorflowKNN');
const fetchEmotions = require ('./lib/fetchEmotions');
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
        emotionData[emotion].slice (0, 20).concat(emotionData[emotion].slice (100, 150)).concat(emotionData[emotion].slice (150, 199))
      );
      for await (const guessEmotion of tensorflowKNN.returnGuessedEmotions()){
        if(guessEmotion.label === emotionsToScrape[emotion]){
          emotionCorrectness[emotion].true +=1
        }else{
          emotionCorrectness[emotion].false +=1
        }
      }
    }
    console.log(Object.keys(emotionCorrectness))
    Object.keys(emotionCorrectness).forEach(emotion=>{
      const currentEmotionResults = emotionCorrectness[emotion]
      console.log(currentEmotionResults)
      const currentEmotionResultsTotal = emotionCorrectness[emotion].true + emotionCorrectness[emotion].false
      const FPR = (currentEmotionResults.false / currentEmotionResultsTotal)* 100 
      const PR = (currentEmotionResults.true / currentEmotionResultsTotal)* 100 

      console.log("-------------------------------")
      console.log(`${emotion} and it's results:`)
      console.log(`The amount of times the emotion was false: ${FPR}%`)
      console.log(`The amount of times the emotion was positive: ${PR}%`)
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
