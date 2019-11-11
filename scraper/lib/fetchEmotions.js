const Scraper = require ('images-scraper');
const fs = require ('fs').promises;

var fetchEmotions = {};

fetchEmotions.fetch = async (keyword, limit) => {
  console.log ('Fetching emotions');
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
  console.log ('Fetched Emotions');

  return results;
};

fetchEmotions.save = async (data, filename) => {
  try {
    await fs.writeFile (
      `./dist/json/${filename}.json`,
      JSON.stringify (data)
    );
  } catch (err) {
    console.log(err)
    throw err;
  }
};

fetchEmotions.read = async filename => {
  try {
    const file = await fs.readFile (`./dist/json/${filename}.json`);
    return JSON.parse(file);
  } catch (err) {
    throw err;
  }
};

export default fetchEmotions;
