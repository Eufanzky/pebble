import { getPOS, POS_COLORS } from '../lib/partsOfSpeech';

interface ReaderTextProps {
  text: string;
  highlightWord: number | null;
  partsOfSpeech: boolean;
  noMotion: boolean;
}

/** The text word by word, so a word can be highlighted or underlined. */
export default function ReaderText({ text, highlightWord, partsOfSpeech, noMotion }: ReaderTextProps) {
  let wordCounter = 0;

  return text.split(/(\s+)/).map((w, i) => {
    if (/^\s+$/.test(w)) return <span key={i}>{w}</span>;

    const index = wordCounter++;
    const highlighted = index === highlightWord;
    const pos = partsOfSpeech ? getPOS(w.toLowerCase().replace(/[^a-z-]/g, '')) : null;

    return (
      <span
        key={i}
        data-pos={pos ?? undefined}
        data-highlighted={highlighted || undefined}
        style={{
          ...(pos ? { borderBottom: `2px solid ${POS_COLORS[pos]}`, paddingBottom: 1 } : {}),
          ...(highlighted ? { background: 'rgba(196,181,212,0.3)', borderRadius: 3, padding: '1px 2px' } : {}),
          transition: noMotion ? 'none' : 'background 0.15s ease',
        }}
      >
        {w}
      </span>
    );
  });
}
