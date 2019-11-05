import fetchEmotions from './lib/fetchEmotions';
import tensorflowKNN from './lib/tensorflowKNN';


let main = async ()=>{
    const res = await fetchEmotions.fetch('happy person', 1)
    await tensorflowKNN.addEmotion('happy', res )
     await tensorflowKNN.save('test.json')
}

main()