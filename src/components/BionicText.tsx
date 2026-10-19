import React from 'react';

interface BionicTextProps {
  text: string;
  enabled: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const BionicText: React.FC<BionicTextProps> = ({
  text,
  enabled,
  className,
  style,
}) => {
  if (!enabled || !text) {
    return <span className={className} style={style}>{text}</span>;
  }

  const words = text.split(' ');

  return (
    <span className={className} style={style}>
      {words.map((word, i) => {
        if (word.length <= 1) {
          return (
            <React.Fragment key={i}>
              <strong>{word}</strong>
              {i < words.length - 1 ? ' ' : ''}
            </React.Fragment>
          );
        }

        const mid = Math.ceil(word.length / 2);
        const boldPart = word.slice(0, mid);
        const restPart = word.slice(mid);

        return (
          <React.Fragment key={i}>
            <strong style={{ fontWeight: 800 }}>{boldPart}</strong>
            <span>{restPart}</span>
            {i < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </span>
  );
};
