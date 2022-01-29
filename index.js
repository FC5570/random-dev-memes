const phin = require('phin');
const cheerio = require('cheerio');
const fastify = require('fastify').default;
const config = require('./config.json');

const app = fastify({ logger: false });

app.get('/', async (req, res) => {
  const data = await getData();
  const $ = cheerio.load(data);

  const div = $(
    '.item-aux-container > .dyn-link > img.img-responsive.grey-background'
  ).get();
  const random = getRandom(div);
  const image = await loadImage(random.image);

  return res
    .headers({
      'Content-Type': 'image/jpeg',
      'Meme-Title': random.title,
      'Meme-Width': random.width,
      'Meme-Height': random.height,
    })
    .send(image);
});

async function getData() {
  const { body } = await phin(
    'https://www.memedroid.com/memes/tag/programming'
  );
  return Buffer.from(body).toString();
}

function getRandom(divs) {
  const random = divs[Math.floor(Math.random() * divs.length)].attribs;
  return {
    title: random.alt.replace(' - meme', '').trim(),
    image: random.src,
    width: random.width,
    height: random.height,
  };
}

async function loadImage(src) {
  const { body } = await phin(src);
  return body;
}

app.listen(config.port);
console.log(`Listening at port ${config.port}`);
