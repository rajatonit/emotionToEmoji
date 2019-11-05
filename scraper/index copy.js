var Scraper = require ('images-scraper');
var pixels = require('image-pixels')
//'happy', 'sad', 'netural','angry'
const emotions = ['happy']
import * as tf from '@tensorflow/tfjs';
import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
var classifier = knnClassifier.create();
const { createCanvas, loadImage } = require('canvas')


let temp = async ()=>{


await emotions.forEach(async emotion=>{
    let google = new Scraper.Google({
        keyword: `${emotion}-face`,
        limit: 2,
        puppeteer: {
            headless: true
        },
      advanced: {
        imgType: 'photo', // options: clipart, face, lineart, news, photo
        resolution: undefined, // options: l(arge), m(edium), i(cons), etc.
        color: undefined // options: color, gray, trans
      }
    });
   await (async () => {
        const results = await google.start();
        const mobilenet = await mobilenetModule.load();
        results.forEach(async element => {
            let {url} = element;
            try{
                console.log("hereee")

                var {data, width, height} = await pixels(url)
                // console.log(data)
                const myimg = await loadImage(url)
                const canvas = createCanvas(200, 200)
                const ctx = canvas.getContext('2d')
                ctx.drawImage(myimg, 50, 0, 70, 70)


                const img= tf.browser.fromPixels(canvas);

                const logits = mobilenet.infer(img, 'conv_preds');
                classifier.addExample(logits,emotion );   
                console.log("done")
            } catch(err){
                console.log(err)
            }
        });
    })();

})

}
// const saveResult = classifier.save('localstorage://my-model-1');

temp().then((res)=>{
    console.log(classifier.getClassifierDataset()) 
})