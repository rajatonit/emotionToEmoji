const Scraper = require ('images-scraper');
var fetchEmotions = {};

fetchEmotions.fetch = async (keyword, limit) => {
    console.log("Fetching emotions")
  let google = new Scraper.Google ({
    keyword,
    limit,
    puppeteer: {
      headless: true,
    },
    advanced: {
      imgType: 'face', // options: clipart, face, lineart, news, photo
      resolution: undefined, // options: l(arge), m(edium), i(cons), etc.
      color: undefined, // options: color, gray, trans
    },
  });

  const results = await google.start ();
  console.log("Fetched Emotions")

  return results;
};

export default fetchEmotions;
