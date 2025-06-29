const fs = require('fs');
const https = require('https');
const path = require('path');

const songs = [
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song1.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song2.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song3.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song4.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song5.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song6.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song7.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song8.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song9.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song10.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song11.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song12.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song13.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song14.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song15.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song16.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song17.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song18.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song19.mp3" },
  { url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae5c7.mp3", filename: "song20.mp3" }
];

const destDir = path.join(__dirname, 'uploads', 'songs');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function downloadSong(song) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(destDir, song.filename));
    https.get(song.url, (response) => {
      if (response.statusCode !== 200) {
        reject(`Failed to get '${song.url}' (${response.statusCode})`);
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(path.join(destDir, song.filename), () => reject(err));
    });
  });
}

(async () => {
  for (const song of songs) {
    try {
      console.log(`Downloading ${song.filename}...`);
      await downloadSong(song);
      console.log(`Downloaded ${song.filename}`);
    } catch (err) {
      console.error(`Error downloading ${song.filename}:`, err);
    }
  }
  console.log('All downloads finished.');
})(); 