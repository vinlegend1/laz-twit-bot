// Require dependencies and helper functions
const Twit = require('twit');
const { tweetWithImage } = require('./helper/tweet');
const fs = require('fs');
const csv = require('csv-parser');
const request = require('request');

// config.js is "git-ignored" and all it has is my api and access token things
const { consumer_key, consumer_secret, access_token, access_token_secret } = require('./config');

// create new Twit object
const T = new Twit({
    consumer_key,
    consumer_secret,
    access_token,
    access_token_secret
});

// downloads image given a url to image
// P.S. I don't know what it means line by line, I just know what it does as a collective group
const download = (uri, filename, callback) => {
    request.head(uri, function(err, res, body){
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);
  
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

const results = [];

function postProduct() {
    fs.createReadStream("vjhongproducts.csv")
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        const random = Math.floor(Math.random() * results.length);
        const product = results[random];
        const imageURL = product.MainImage ? product.MainImage : product['132'];
        const name = product.name ? product.name : product['3'];
        const price = product.price ? product.price : product['123'];
        const special_price = product.special_price ? product.special_price : product['124'];
          
        download(imageURL, 'product.jpg', () => {
            const randnum = Math.floor(Math.random() * 1000);
            const message = `${name} at sale price of P${parseInt(price) == parseInt(special_price) || !special_price ? price : special_price} #lazada #seller #retail #cheap #reseller ${randnum} Link to shop: https://www.lazada.com.ph/shop/vj-hong/?spm=a2o4l.pdp.seller.1.15bf6f71alznuI&itemId=1214750431&channelSource=pdp`;
            
            const b64content = fs.readFileSync('./product.jpg', { encoding: 'base64' })
            tweetWithImage(T, b64content, message, name);
        });
    });
}

// For testing purposes
postProduct();

// tweet with product image every 20 minutes
setInterval(() => postProduct(), 1000 * 60 * 20);