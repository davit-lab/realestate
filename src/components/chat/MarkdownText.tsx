import React from 'react';

interface MarkdownTextProps {
 text: string;
 className?: string;
}

export default function MarkdownText({ text, className = '' }: MarkdownTextProps) {
 const lines = text.split('\n');

 return (
 <div className={`text-[13px] leading-relaxed ${className}`}>
  {lines.map((line, li) => {
  const trimmed = line.trim();
  if (!trimmed) return <br key={li} />;

  // List item
  if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
   const content = parseInline(trimmed.slice(2));
   return (
   <div key={li} className="flex items-start gap-2 my-0.5">
    <span className="w-1 h-1 rounded-full bg-current mt-2 shrink-0 opacity-60" />
    <span>{content}</span>
   </div>
   );
  }

  return <div key={li} className="my-0.5">{parseInline(trimmed)}</div>;
  })}
 </div>
 );
}

function parseInline(text: string): React.ReactNode[] {
 const parts: React.ReactNode[] = [];
 const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
 let lastIndex = 0;
 let match: RegExpExecArray | null;

 while ((match = regex.exec(text)) !== null) {
 if (match.index > lastIndex) {
  parts.push(text.slice(lastIndex, match.index));
 }

 const full = match[0];
 if (full.startsWith('**')) {
  parts.push(<strong key={match.index} className="font-semibold">{match[2]}</strong>);
 } else if (full.startsWith('*') && !full.startsWith('**')) {
  parts.push(<em key={match.index} className="italic">{match[3]}</em>);
 } else if (full.startsWith('`')) {
  parts.push(
  <code key={match.index} className="px-1 py-0.5 rounded bg-black/5 text-[12px] font-mono">
   {match[4]}
  </code>
  );
 } else if (full.startsWith('[')) {
  parts.push(
  <a
   key={match.index}
   href={match[6]}
   target="_blank"
   rel="noopener noreferrer"
   className="underline decoration-purple-400 underline-offset-2 hover:text-purple-600 transition-colors"
  >
   {match[5]}
  </a>
  );
 }

 lastIndex = regex.lastIndex;
 }

 if (lastIndex < text.length) {
 parts.push(text.slice(lastIndex));
 }

 return parts.length ? parts : [text];
}
