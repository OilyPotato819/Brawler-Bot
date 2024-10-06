const yts = require('yt-search');

async function getSongs(input, mediaType) {
  if (!input.includes('youtube.com') && !input.includes('youtu.be')) {
    return 'not a valid link';
  }

  let patterns = {
    video: /(?<=\/|v=)[-_A-Za-z0-9]{11}/,
    playlist: /(?<=list=)[-_A-Za-z0-9]+/,
  };

  const match = input.match(patterns[mediaType]);
  if (!match) return `link is missing a ${mediaType} id`;

  const id = match[0];
  const idType = mediaType.replace('play', '') + 'Id';

  try {
    const media = await yts({ [idType]: id });
    return media.title;
  } catch (error) {
    return `unable to find ${mediaType}`;
  }
}

async function log() {
  console.log(
    await getSongs(
      'https://www.youtube.com/watch?v=E2L6NxLf3ic&list=PLTo6svdhIL1cxS4ffGueFpVCF756ip-ab&index=1',
      'video'
    )
  );
}

log();
