var Scraper = require ('images-scraper');
var pixels = require('image-pixels')

let google = new Scraper.Google({
    keyword: 'banana',
    limit: 200,
    puppeteer: {
        headless: false
    },
  advanced: {
    imgType: 'photo', // options: clipart, face, lineart, news, photo
    resolution: undefined, // options: l(arge), m(edium), i(cons), etc.
    color: undefined // options: color, gray, trans
  }
});
 
(async () => {
    const results = await google.start();
    results.forEach(async element => {
        let {url} = element;
        var {data, width, height} = await pixels(url)
        console.log(width)

        
    });
})();