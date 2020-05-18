const fetchEmotions = require ('./lib/scrapeEmotionImages');
const fs = require('fs');
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
    try {

        console.log ('Scraping Emotions on ', new Date ().toJSON ());

        for await (const emotion of emotionsToScrape) {
            const res = await fetchEmotions.fetch (emotion, 50);
            finalEmotions[emotion] = res;
        }
        await fetchEmotions.save (finalEmotions, 'final');

        console.log  ('Finished scraping Emotions on ', new Date ().toJSON ());

        console.log('Downloading images locally onto machine ', new Date ().toJSON ())

        const allEmotionImages = await  fetchEmotions.read('final')

        for await (const currentEmotion of Object.keys(allEmotionImages)) {
            let index = 0
            if (!fs.existsSync(`./dist/${currentEmotion}/`)){
                fs.mkdirSync(`./dist/${currentEmotion}/`);
            }
            let currentEmotionImages = allEmotionImages[currentEmotion];
            for await (const currentSubEmotion of currentEmotionImages){
                await  fetchEmotions.download(currentSubEmotion.url, currentEmotion, index);
                index ++;
            }
        }


        return;
    } catch (err) {
        console.error  ('Error scraping emotions ', err, ' ', new Date ().toJSON ());
        // console.log(err)
        throw err;
    }
};

main ();