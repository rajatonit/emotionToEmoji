import * as tf from '@tensorflow/tfjs';
import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
var classifier = knnClassifier.create ();
const {createCanvas, loadImage} = require ('canvas');
const tensorflowKNN = {};
const fs = require ('fs');
const pixels = require ('image-pixels');

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
            resolve()
          } catch (err) {
            reject(err)
          }
        })
      );
    }


    return Promise.allSettled(promises)
  }) ();
};

tensorflowKNN.save = async fileName => {
  var datasetObj = {};

  await new Promise (async (res, rej) => {
    let dataset = classifier.getClassifierDataset ();
    await Object.keys (dataset).forEach (async key => {
      let data = await dataset[key].dataSync ();
      // use Array.from() so when JSON.stringify() it covert to an array string e.g [0.1,-0.2...]
      // instead of object e.g {0:"0.1", 1:"-0.2"...}
      datasetObj[key] = Array.from (data);
    });
    let jsonStr = JSON.stringify (datasetObj);
    fs.writeFile (`${__dirname}/../dist/${fileName}`, jsonStr, err => {
      if (err) rej (err);
      res ();
      // console.log ('Saved to: ' + `${__dirname}/../dist/${fileName}.json`);
    });
  });
};

tensorflowKNN.loadModel =  (filename) => {

    fs.readFile(`${__dirname}/../dist/${fileName}`, (err, dataset)=>{
        let tensorObj = JSON.parse(dataset)
        //covert back to tensor
        Object.keys(tensorObj).forEach((key) => {
          tensorObj[key] = tf.tensor(tensorObj[key], [tensorObj[key].length / 1000, 1000])
        })
        classifier.setClassifierDataset(tensorObj);

    })
 }

export default tensorflowKNN;
