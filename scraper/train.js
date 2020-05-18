// const fetchEmotions = require ('./lib/fetchEmotions');
const tensorflowKNN = require ('./lib/tensorflowKNN');
const fs = require('fs');
// const Logger = require('./logger/logger')

const emotionsToScrape = [
    "anger",
    "contempt",
    "disgust",
    "fear",
    "happiness",
    "neutral",
    "sadness",
    "surprise"
];
var finalEmotions = {};

let main = async () => {

    for await ( const label of emotionsToScrape ) {
        try {
            console.log('Starting training of data on: ', label, new Date().toJSON())
            const files = fs.readdirSync(`./dist/${label}/`);
            console.log(files)
            await tensorflowKNN.addEmotion (
                files,
                label
             );
            console.log('Finished training of emotion',  label , ' on: ', new Date().toJSON())


        } catch (err) {
            console.error(err)
        }
    }
    await tensorflowKNN.save ('final_emotions_model.json');


    // const log = new Logger('info').getLog()
    // try {
    //     log.info('Starting training of data on: ', new Date().toJSON())
    //     let emotionData = await fetchEmotions.read ('final');
    //     for await (const emotion of Object.keys (emotionData)) {
    //         log.info('Starting training of emotion',  emotion , ' on: ', new Date().toJSON())
    //         await tensorflowKNN.addEmotion (
    //             emotionsToScrape[emotion],
    //             emotionData[emotion].slice (0, 150),
    //             log
    //         );
    //         log.info('Finished training of emotion',  emotion , ' on: ', new Date().toJSON())
    //     }
    //     await tensorflowKNN.save ('final_emotions_model.json', log);
    //
    //     // await fetchEmotions.save(finalEmotions,'final')
    //
    //     log.info('Finished training of data on: ', new Date().toJSON())
    //     return;
    // } catch (err) {
    //     log.error('Error on training of data ', err , ' ', new Date().toJSON())
    //     throw err;
    // }
    // // await tensorflowKNN.save ('test.json');
};

main ();
