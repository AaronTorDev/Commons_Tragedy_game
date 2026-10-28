import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

/**
 * Renderiza una expresión LaTeX directa de forma síncrona con KaTeX.
 */
export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch {
      return math;
    }
  }, [math, block]);

  return (
    <span
      className={`inline-block ${block ? 'w-full text-center my-1' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Parsea un texto que contiene fragmentos en LaTeX con delimitadores:
 * - $$formula$$ para modo bloque
 * - $formula$ para modo en línea
 */
export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  const parts = useMemo(() => {
    if (!text) return [];

    // Regex to capture $$...$$ or $...$
    const regex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
    const tokens = text.split(regex);

    return tokens.map((token, index) => {
      if (token.startsWith('$$') && token.endsWith('$$')) {
        const math = token.slice(2, -2).trim();
        return <MathView key={index} math={math} block={true} />;
      }
      if (token.startsWith('$') && token.endsWith('$')) {
        const math = token.slice(1, -1).trim();
        return <MathView key={index} math={math} block={false} />;
      }
      return <span key={index}>{token}</span>;
    });
  }, [text]);

  return <span className={className}>{parts}</span>;
};
