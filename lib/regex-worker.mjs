self.onmessage = ({ data: { pattern, flags, text } }) => {
  try {
    const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
    const matches = [];
    for (const match of text.matchAll(regex)) {
      matches.push({ text: match[0], index: match.index, groups: [...match].slice(1) });
      if (matches.length >= 1000) break;
    }
    self.postMessage({ matches });
  } catch (error) { self.postMessage({ error: error.message }); }
};
