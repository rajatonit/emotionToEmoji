const tf = require ('@tensorflow/tfjs');
const mobilenetModule = require ('@tensorflow-models/mobilenet');
const knnClassifier = require ('@tensorflow-models/knn-classifier');
var classifier = knnClassifier.create ();
const {createCanvas, loadImage} = require ('canvas');
const tensorflowKNN = {};
const fs = require ('fs');
const pixels = require ('image-pixels');
var guessedEmotions = []

tensorflowKNN.addEmotion = async (emotion, data) => {
  await (async () => {
    const mobilenet = await mobilenetModule.load ();
    let promises = [];
    for await (const element of data) {
      promises.push (
        new Promise (async (resolve, reject) => {
          let {url} = element;
          try {
            var {width, height} = await pixels (url);
            const myimg = await loadImage (url);
            const canvas = createCanvas (width, height);
            const ctx = canvas.getContext ('2d');
            ctx.drawImage (myimg, 50, 0, width, height);

            const img = await tf.browser.fromPixels (canvas);

            const logits = mobilenet.infer (img, 'conv_preds');
            classifier.addExample (logits, emotion);
            resolve ();
          } catch (err) {
            reject (err);
          }
        })
      );
    }

    return Promise.allSettled (promises);
  }) ();
};

tensorflowKNN.save = async fileName => {
  var datasetObj = {};

  await new Promise (async (res, rej) => {
    try {
      let dataset = classifier.getClassifierDataset ();
      Object.keys (dataset).forEach (async key => {
        let data = dataset[key].dataSync ();
        // use Array.from() so when JSON.stringify() it covert to an array string e.g [0.1,-0.2...]
        // instead of object e.g {0:"0.1", 1:"-0.2"...}
        datasetObj[key] = Array.from (data);
      });
      let jsonStr = JSON.stringify (datasetObj);
      fs.writeFile (
        `${__dirname}/../dist/${fileName}`,
        JSON.stringify (datasetObj),
        err => {
          if (err) rej (err);
          res ();
          // console.log ('Saved to: ' + `${__dirname}/../dist/${fileName}.json`);
        }
      );
    } catch (err) {
      console.log (err);
      rej (err);
    }
  });
};

tensorflowKNN.loadModel = async fileName => {
  await new Promise ((res, rej) => {
    fs.readFile (`${__dirname}/../dist/${fileName}`, async (err, dataset) => {
      if (err) rej (err);
      let tensorObj = JSON.parse (dataset);
      //covert back to tensor
      Object.keys (tensorObj).forEach (key => {
        tensorObj[key] = tf.tensor2d (tensorObj[key], [
          tensorObj[key].length / 1024,
          1024,
        ]);
      });
      classifier.setClassifierDataset (tensorObj);
      res ();
    });
  });
};

tensorflowKNN.returnEmotion = async (emotion, data) => {
  await (async () => {
    const mobilenet = await mobilenetModule.load ();
    let promises = [];
    guessedEmotions = []

    for await (const element of data) {
      promises.push (
        new Promise (async (resolve, reject) => {
          let {url} = element;
          try {
            var {width, height} = await pixels (url);
            const myimg = await loadImage (url);
            const canvas = createCanvas (width, height);
            const ctx = canvas.getContext ('2d');
            ctx.drawImage (myimg, 50, 0, width, height);

            const img = await tf.browser.fromPixels (canvas);

            const logits = mobilenet.infer (img, 'conv_preds');
            const emotions = await classifier.predictClass (logits);
            console.log ("Actual: "+ emotion + " Result: "+ JSON.stringify (emotions));
            guessedEmotions.push(emotions)
            resolve (emotions);
          } catch (err) {
            console.log (err);
            reject (err);
          }
        })
      );
    }

    return await Promise.allSettled (promises);

  }) ();
};


tensorflowKNN.returnGuessedEmotions = ()=>{
  return guessedEmotions;
}

module.exports= tensorflowKNN;
