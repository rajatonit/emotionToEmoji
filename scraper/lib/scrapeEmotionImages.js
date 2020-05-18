const Scraper = require ('images-scraper');
const fs = require ('fs').promises;
const download = require('image-downloader')

var fetchEmotions = {};

fetchEmotions.fetch = async (keyword, limit) => {
    console.log (`Fetching emotions - ${keyword} on`, new Date ().toJSON ());
    let google =  new Scraper ({
        puppeteer: {
            headless: false,
        },
        tbs: {  // every possible tbs search option, some examples and more info: http://jwebnet.net/advancedgooglesearch.html
            // isz: 'large',  // options: l(arge), m(edium), i(cons), etc.
            itp: 'face', // options: clipart, face, lineart, news, photo
            ic: 'color',  // options: color, gray, trans
            // sur: 'f' // options: fmc (commercial reuse with modification), fc (commercial reuse), fm (noncommercial reuse with modification), f (noncommercial reuse)
            },
});
    try {
        const results = await google.scrape (keyword,limit);
        console.log (
            `Finished Fetching emotions - ${keyword} on`,
            new Date ().toJSON ()
        );
        return results;
    } catch (err) {
        console.error (
            `Error Fetching emotions - ${keyword} `,
            err,
            ' ',
            new Date ().toJSON ()
        );
        throw err;
    }
};

fetchEmotions.save = async (data, filename) => {
    try {
        await fs.writeFile (`./dist/json/${filename}.json`, JSON.stringify (data));
    } catch (err) {
        console.error (err);
        throw err;
    }
};

fetchEmotions.read = async filename => {
    try {
        const file = await fs.readFile (`./dist/json/${filename}.json`);
        return JSON.parse (file);
    } catch (err) {
        throw err;
    }
};

fetchEmotions.download = async (imageUrl, label,index=0) =>{
    console.log(label)
    let temp = imageUrl.split('.')
    if (temp !== '.jpg' || temp !== '.png'){
        temp = '.jpg'
    }
    temp = temp [temp.length -1]
    const options = {
        url: imageUrl,
        dest: `./dist/${label}/${label}_${index}.${temp}` ,               // will be saved to /path/to/dest/image.jpg
        extractFilename: false
    }
    try{
        await download.image(options)
    }catch(err){
        console.error(`Could not download image ${imageUrl}`)
    }
};

module.exports = fetchEmotions;