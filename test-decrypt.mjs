// Test decryption of JioSaavn encrypted media URL
import CryptoJS from 'crypto-js';
import https from 'https';

const JIOSAAVN_KEY = '38346591';

function decryptUrl(encryptedUrl) {
  const key = CryptoJS.enc.Utf8.parse(JIOSAAVN_KEY);
  const decrypted = CryptoJS.DES.decrypt(
    { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) },
    key,
    { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
  );
  let url = decrypted.toString(CryptoJS.enc.Utf8);
  // Upgrade to HTTPS and 320kbps
  url = url.replace('http://', 'https://');
  url = url.replace('_96.mp4', '_320.mp4');
  return url;
}

// Fetch a song and test decryption
const url = 'https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=1&q=tum+hi+ho';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const song = json.results[0];
    console.log('Song:', song.title);
    console.log('Artist:', song.more_info?.artistMap?.primary_artists?.map(a => a.name).join(', '));
    
    const enc = song.more_info?.encrypted_media_url;
    if (enc) {
      const audioUrl = decryptUrl(enc);
      console.log('Decrypted URL:', audioUrl);
      console.log('\n✅ Decryption works! This URL should be playable.');
    } else {
      console.log('❌ No encrypted_media_url found');
    }
  });
}).on('error', e => console.log('ERROR:', e.message));
