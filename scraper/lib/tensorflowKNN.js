const tf = require ('@tensorflow/tfjs');
const mobilenetModule = require ('@tensorflow-models/mobilenet');
const knnClassifier = require ('@tensorflow-models/knn-classifier');
var classifier = knnClassifier.create ();
const {createCanvas, loadImage} = require ('canvas');
const tensorflowKNN = {};
const fs = require ('fs');
const pixels = require ('image-pixels');
var guessedEmotions = [];
// const Logger = require ('../logger/logger');

tensorflowKNN.addEmotion = async ( data, emotion) => {
    await (async () => {
        console.log ('loading mobilenet module ', new Date ().toJSON ());
        const mobilenet = await mobilenetModule.load ();
        let promises = [];
        console.log ('finished loading mobilenet module ', new Date ().toJSON ());
        for await (const element of data) {
            if(element.includes('.DS_Store')){
                continue;
            }
            promises.push (
                new Promise (async (resolve, reject) => {
                    console.log (
                        'Inserting ',
                        element,
                        '  for emotion ',
                        emotion,
                        ' ',
                        new Date ().toJSON ()
                    );
                    let url = `./dist/${emotion}/${element}`;
                    try {
                        var {width, height} = await pixels (url);
                        console.log(width, height)

                        const myimg = await loadImage (url);
                        const canvas = createCanvas (width, height);
                        const ctx = canvas.getContext ('2d');
                        ctx.drawImage (myimg, 50, 0, width, height);

                        const img = await tf.browser.fromPixels (canvas);

                        const logits = mobilenet.infer (img, 'conv_preds');
                        classifier.addExample (logits, emotion);
                        console.log (
                            'Finished inserting ',
                            element,
                            '  for emotion ',
                            emotion,
                            ' ',
                            new Date ().toJSON ()
                        );

                        resolve ();
                    } catch (err) {
                        console.error (
                            'Error inserting ',
                            err,
                            ' ',
                            new Date ().toJSON ()
                        );
                        reject (err);
                    }
                })
            );
        }

        await Promise.allSettled (promises);
    }) ();
};

tensorflowKNN.save = async (fileName, logger) => {
    var datasetObj = {};

    await new Promise (async (res, rej) => {
        try {
            console.log ('Converting model to json ', new Date ().toJSON ());

            let dataset = classifier.getClassifierDataset ();
            Object.keys (dataset).forEach (async key => {
                let data = dataset[key].dataSync ();
                // use Array.from() so when JSON.stringify() it covert to an array string e.g [0.1,-0.2...]
                // instead of object e.g {0:"0.1", 1:"-0.2"...}
                datasetObj[key] = Array.from (data);
            });
            let jsonStr = JSON.stringify (datasetObj);
            console.log ('Finished converting model to json ', new Date ().toJSON ());
            console.log (
                'Saving model to ',
                `./dist/${fileName}`,
                new Date ().toJSON ()
            );
            fs.writeFile (`./dist/${fileName}`, JSON.stringify (datasetObj), err => {
                if (err) rej (err);
                console.log (
                    'Finished Saving model to ',
                    `./dist/${fileName}`,
                    new Date ().toJSON ()
                );
                res ();
            });
        } catch (err) {
            console.error(
                'Error saving model to ',
                `./dist/${fileName} `,
                err,
                new Date ().toJSON ()
            );
            rej (err);
        }
    });
};

tensorflowKNN.loadModel = async (fileName, logger) => {
    await new Promise ((res, rej) => {
        console.log (
            'Reading  model from ',
            `./dist/${fileName} `,
            new Date ().toJSON ()
        );

        fs.readFile (`./dist/${fileName}`, async (err, dataset) => {
            if (err) rej (err);
            console.log (
                'Finished Reading  model from ',
                `./dist/${fileName} `,
                new Date ().toJSON ()
            );

            console.log('Converting  json to model ', new Date ().toJSON ());

            let tensorObj = JSON.parse (dataset);
            //covert back to tensor
            Object.keys (tensorObj).forEach (key => {
                tensorObj[key] = tf.tensor2d (tensorObj[key], [
                    tensorObj[key].length / 1024,
                    1024,
                ]);
            });
            classifier.setClassifierDataset (tensorObj);
            console.log(
                'Finished converting  json to model ',
                new Date ().toJSON ()
            );

            res ();
        });
    });
};

tensorflowKNN.returnEmotion = async ( data, emotion) => {
    await (async () => {
        console.log('Loading emotion model ', new Date ().toJSON ());
        const mobilenet = await mobilenetModule.load ();
        console.log ('Finished loading emotion model ', new Date ().toJSON ());
        let promises = [];
        guessedEmotions = [];

        for await (const element of data) {
            if(element.includes('.DS_Store')){
                continue;
            }
            promises.push (
                new Promise (async (resolve, reject) => {
                    let url = `./dist/${emotion}/${element}`;
                    try {
                        console.log (
                            'Evaluating  ',
                            element,
                            ' with emotion ',
                            emotion,
                            ' ',
                            new Date ().toJSON ()
                        );

                        var {width, height} = await pixels (url);
                        const myimg = await loadImage (url);
                        const canvas = createCanvas (width, height);
                        const ctx = canvas.getContext ('2d');
                        ctx.drawImage (myimg, 50, 0, width, height);

                        const img = await tf.browser.fromPixels (canvas);

                        const logits = mobilenet.infer (img, 'conv_preds');
                        const emotions = await classifier.predictClass (logits);
                        console.log (
                            'Actual  ',
                            emotion,
                            '  Result  ',
                            emotions,
                            ' ',
                            new Date ().toJSON ()
                        );

                        // console.log ("Actual: "+ emotion + " Result: "+ JSON.stringify (emotions));
                        guessedEmotions.push (emotions);
                        resolve (emotions);
                    } catch (err) {
                        console.error (err);
                        reject (err);
                    }
                })
            );
        }

        await Promise.allSettled (promises);
    }) ();
};

tensorflowKNN.returnGuessedEmotions = () => {
    return guessedEmotions;
};

module.exports = tensorflowKNN;
