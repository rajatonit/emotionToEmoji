import fetchEmotions from './lib/fetchEmotions';
import tensorflowKNN from './lib/tensorflowKNN';

let main = async () => {
  try {
    const res = await fetchEmotions.fetch ('happy person', 20);
    await tensorflowKNN.addEmotion ('happy', res);
  } catch (err) {
      throw(err)
  }
  await tensorflowKNN.save ('test.json');
};

main ();
