const tensorflowKNN = require('./lib/tensorflowKNN');
const fs = require('fs');

const emotionsToScrape = {
    "anger" :{},
    "contempt":{},
    "disgust":{},
    "fear":{},
    "happiness":{},
    "neutral":{},
    "sadness":{},
    "surprise":{}
};
const emotionCorrectness = {};

let main = async () => {
    try {

        console.log('Loading KNN model ', new Date().toJSON());
        await tensorflowKNN.loadModel('final_emotions_model.json');
        console.log('Starting training of data on: ', new Date().toJSON())

        for await (const label of Object.keys(emotionsToScrape)) {
                emotionCorrectness[label] = {
                    true: 0, // times right
                    false: 0, //times wrong
                };
                const files = fs.readdirSync(`./dist/${label}/`);
                console.log(
                    'Testing emotion ',
                    label,
                    ' against model ',
                    new Date().toJSON()
                );
                await tensorflowKNN.returnEmotion(
                    files,
                    label
                );
                console.log('Finished training of emotion', label, ' on: ', new Date().toJSON())
                for await (const guessEmotion of tensorflowKNN.returnGuessedEmotions()) {
                    if (guessEmotion.label === label) {
                        emotionCorrectness[label].true += 1;
                    } else {
                        emotionCorrectness[label].false += 1;
                    }
                }
                console.log(
                    'Finished testing emotion ',
                    label,
                    ' against model ',
                    new Date().toJSON()
                );
            }
        for await (const label of Object.keys(emotionsToScrape)) {
            const currentEmotionResults = emotionCorrectness[label];
            console.log (
                'Raw results for ',
                label,
                ' ',
                currentEmotionResults,
                ' ',
                new Date ().toJSON ()
            );
            const currentEmotionResultsTotal =
                emotionCorrectness[label].true + emotionCorrectness[label].false;
            const FPR =
                currentEmotionResults.false / currentEmotionResultsTotal * 100;
            const PR = currentEmotionResults.true / currentEmotionResultsTotal * 100;

            console.log ('-------------------------------');
            console.log (
                `The amount of times the ${label} was false: ${FPR}% `,
                new Date().toJSON ()
            );
            console.log (
                `The amount of times the ${label} was positive: ${PR}% `,
                new Date().toJSON ()
            );
            console.log ('-------------------------------');
        }

        // const log = new Logger ('info').getLog ();
        // logger.info ('Loading KNN model ', new Date ().toJSON ());
        //
        // await tensorflowKNN.loadModel ('final_emotions_model.json', log);
        // logger.info ('Finished loading emotion model ', new Date ().toJSON ());
        // let emotionData = await fetchEmotions.read ('final');
        //
        // for await (const emotion of Object.keys (emotionData)) {
        //     emotionCorrectness[emotion] = {
        //         true: 0, // times right
        //         false: 0, //times wrong
        //     };
        //     logger.info (
        //         'Testing emotion ',
        //         emotion,
        //         ' against model ',
        //         new Date ().toJSON ()
        //     );
        //
        //     await tensorflowKNN.returnEmotion (
        //         emotionsToScrape[emotion],
        //         emotionData[emotion]
        //             .slice (0, 20)
        //             .concat (emotionData[emotion].slice (100, 150))
        //             .concat (emotionData[emotion].slice (150, 199)),
        //         log
        //     );
        //     for await (const guessEmotion of tensorflowKNN.returnGuessedEmotions ()) {
        //         if (guessEmotion.label === emotionsToScrape[emotion]) {
        //             emotionCorrectness[emotion].true += 1;
        //         } else {
        //             emotionCorrectness[emotion].false += 1;
        //         }
        //     }
        //     logger.info (
        //         'Finished testing emotion ',
        //         emotion,
        //         ' against model ',
        //         new Date ().toJSON ()
        //     );
        // }
        // logger.debug (Object.keys (emotionCorrectness));
        // Object.keys (emotionCorrectness).forEach (emotion => {
        //     const currentEmotionResults = emotionCorrectness[emotion];
        //     logger.debug (
        //         'Raw emotion results ',
        //         currentEmotionResults,
        //         ' ',
        //         new Date ().toJSON ()
        //     );
        //     const currentEmotionResultsTotal =
        //         emotionCorrectness[emotion].true + emotionCorrectness[emotion].false;
        //     const FPR =
        //         currentEmotionResults.false / currentEmotionResultsTotal * 100;
        //     const PR = currentEmotionResults.true / currentEmotionResultsTotal * 100;
        //
        //     console.log ('-------------------------------');
        //     logger.info (
        //         `The amount of times the ${emotion} was false: ${FPR}% `,
        //         new Date.toJSON ()
        //     );
        //     logger.info (
        //         `The amount of times the ${emotion} was positive: ${PR}% `,
        //         new Date.toJSON ()
        //     );
        //     console.log ('-------------------------------');
        // });

        return;
    } catch (err) {
        console.error(
            ' Error when testing all emotions ',
            err,
            ' ',
            new Date ().toJSON ()
        );
        throw err;
    }
};

main();
