// Quick test of JioSaavn internal API
import https from 'https';

const url = 'https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=2&q=arijit+singh';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      // JioSaavn sometimes prepends with ")]}'" or similar
      const cleaned = data.replace(/^\)\]\}'/, '');
      const json = JSON.parse(cleaned);
      const results = json.results || [];
      console.log('STATUS:', res.statusCode);
      console.log('RESULTS COUNT:', results.length);
      if (results.length > 0) {
        const s = results[0];
        console.log('\n--- FIRST SONG ---');
        console.log('id:', s.id);
        console.log('title:', s.title);
        console.log('image:', s.image);
        console.log('type:', s.type);
        console.log('more_info keys:', Object.keys(s.more_info || {}));
        console.log('duration:', s.more_info?.duration);
        console.log('has encrypted_media_url:', !!s.more_info?.encrypted_media_url);
        console.log('encrypted_media_url (first 80):', (s.more_info?.encrypted_media_url || '').slice(0, 80));
        console.log('320kbps:', s.more_info?.['320kbps']);
        console.log('album:', s.more_info?.album);
        console.log('primary_artists:', JSON.stringify(s.more_info?.artistMap?.primary_artists?.map(a => a.name)));
        console.log('media_preview_url:', s.more_info?.media_preview_url);
      }
    } catch(e) {
      console.log('PARSE ERROR:', e.message);
      console.log('RAW (first 500):', data.slice(0, 500));
    }
  });
}).on('error', e => console.log('REQUEST ERROR:', e.message));
