import * as tf from '@tensorflow/tfjs';
import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import {rejects} from 'assert';
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
            console.log ('data');
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
            console.log (err);
          }
        })
      );
    }
    await Promise.all(promises)
  }) ();
};

tensorflowKNN.save = async fileName => {
  var datasetObj = {};
  console.log ('here');

  await new Promise (async (res, rej) => {
    console.log ('here');
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

export default tensorflowKNN;
