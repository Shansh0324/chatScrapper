import type { ConversationTurn } from "./scraper";

/**
 * Strips emojis from text using Unicode property escapes.
 */
function stripEmojis(text: string): string {
  // \p{Emoji_Presentation} and \p{Extended_Pictographic} cover most emojis
  return text
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    // Clean up any weird spacing left behind
    .replace(/  +/g, ' ')
    .trim();
}

/**
 * Extracts and formats the notes cleanly, preserving the full assistant content
 * while removing emojis and ignoring user turns.
 */
export async function extractNotes(
  turns: ConversationTurn[],
  topic?: string
): Promise<string> {
  const lines: string[] = [];
  lines.push("# Study Notes");
  lines.push("");

  if (topic && topic.trim()) {
    lines.push(`> **Focus topic:** ${topic.trim()}`);
    lines.push("");
  }

  lines.push("---");
  lines.push("");

  // Only keep the assistant's turns (remove user chat)
  const assistantTurns = turns.filter((t) => t.role === "assistant");
  
  // Combine all clean content first to parse headings
  let fullContent = "";
  assistantTurns.forEach((turn, index) => {
    const cleanContent = stripEmojis(turn.content);
    if (cleanContent.trim().length > 0) {
      fullContent += cleanContent + "\n\n";
      if (index < assistantTurns.length - 1) {
        fullContent += "---\n\n";
      }
    }
  });

  // Generate Table of Contents using HTML to avoid Markdown parsing bugs
  let tocHtml = `<div class="table-of-contents">\n<ul>\n`;
  let hasHeadings = false;
  
  const modifiedContent = fullContent.split("\n").map(line => {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      hasHeadings = true;
      const level = match[1].length;
      const title = match[2];
      
      // Create a slug for the link
      const slug = title.toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '');
      
      // Indent based on level (level 1 = 0px, level 2 = 20px, level 3 = 40px)
      const marginLeft = (level - 1) * 20;
      tocHtml += `  <li style="margin-left: ${marginLeft}px; list-style-type: ${level === 1 ? 'disc' : 'circle'};"><a href="#${slug}">${title}</a></li>\n`;
      
      // Explicitly inject anchor tag for both PDF (marked) and Preview (react-markdown)
      return `${match[1]} <a id="${slug}"></a>${title}`;
    }
    return line;
  }).join("\n");

  tocHtml += `</ul>\n</div>\n`;

  if (hasHeadings) {
    lines.push("## Table of Contents");
    lines.push("");
    lines.push(tocHtml);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  lines.push(modifiedContent);

  return lines.join("\n");
}
