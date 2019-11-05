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
    for await (const element of data) {
      let {url} = element;
      try {
        var {data, width, height} = await pixels (url);
        console.log ('data');
        const myimg = await loadImage (url);
        const canvas = createCanvas (200, 200);
        const ctx = canvas.getContext ('2d');
        ctx.drawImage (myimg, 50, 0, 70, 70);

        const img = await tf.browser.fromPixels (canvas);

        const logits = mobilenet.infer (img, 'conv_preds');
        classifier.addExample (logits, emotion);
      } catch (err) {
        console.log (err);
      }
    }
    // data.forEach (async element => {
    //   let {url} = element;
    //   try {
    //     var {data, width, height} = await pixels (url);
    //     console.log('data')
    //     const myimg = await loadImage (url);
    //     const canvas = createCanvas (200, 200);
    //     const ctx = canvas.getContext ('2d');
    //     ctx.drawImage (myimg, 50, 0, 70, 70);

    //     const img = await tf.browser.fromPixels (canvas);

    //     const logits = mobilenet.infer (img, 'conv_preds');
    //     classifier.addExample (logits, emotion);
    //   } catch (err) {
    //     console.log (err);
    //   }
    // });
  }) ();
};

tensorflowKNN.save = async fileName => {
  var datasetObj = {};
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
