import type { ConversationTurn } from "./scraper";

// ─── Stopwords ───────────────────────────────────────────────────────────────
// A comprehensive list so we don't need a runtime import that might fail
const STOPWORDS = new Set([
  "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
  "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she",
  "her", "hers", "herself", "it", "its", "itself", "they", "them", "their",
  "theirs", "themselves", "what", "which", "who", "whom", "this", "that",
  "these", "those", "am", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an",
  "the", "and", "but", "if", "or", "because", "as", "until", "while", "of",
  "at", "by", "for", "with", "about", "against", "between", "through",
  "during", "before", "after", "above", "below", "to", "from", "up", "down",
  "in", "out", "on", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "both",
  "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not",
  "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will",
  "just", "don", "should", "now", "d", "ll", "m", "o", "re", "ve", "y",
  "ain", "aren", "couldn", "didn", "doesn", "hadn", "hasn", "haven", "isn",
  "ma", "mightn", "mustn", "needn", "shan", "shouldn", "wasn", "weren",
  "won", "wouldn", "also", "would", "could", "might", "shall", "may",
  "let", "like", "well", "know", "think", "get", "got", "go", "going",
  "want", "need", "say", "said", "make", "made", "use", "used", "using",
  "one", "two", "way", "thing", "things", "something", "anything",
  "everything", "nothing", "yeah", "yes", "no", "ok", "okay", "sure",
  "right", "really", "actually", "basically", "essentially", "just",
  "kind", "sort", "type", "bit", "lot", "much", "many", "even", "still",
  "already", "else", "back", "take", "give", "tell", "come", "see",
  "look", "put", "try", "keep", "help", "start", "show", "hear",
  "play", "run", "move", "live", "believe", "bring", "happen",
  "write", "provide", "sit", "stand", "lose", "pay", "meet", "include",
  "continue", "set", "learn", "change", "lead", "understand", "watch",
  "follow", "stop", "create", "speak", "read", "add", "spend", "grow",
  "open", "walk", "win", "offer", "remember", "love", "consider",
  "appear", "buy", "wait", "serve", "die", "send", "expect", "build",
  "stay", "fall", "cut", "reach", "kill", "remain",
]);

// ─── Sentence tokenizer ─────────────────────────────────────────────────────

function tokenizeSentences(text: string): string[] {
  // Split on sentence boundaries, keeping the delimiter with the sentence
  // Handles: period, exclamation, question mark followed by space or end
  // Avoids splitting on abbreviations, decimals, URLs, etc.
  const raw = text
    // Normalize whitespace
    .replace(/\s+/g, " ")
    .trim();

  const sentences: string[] = [];
  // Regex-based sentence splitter
  const parts = raw.split(/(?<=[.!?])\s+(?=[A-Z])/);

  for (const part of parts) {
    const trimmed = part.trim();
    // Only keep sentences with at least 5 words
    if (trimmed && trimmed.split(/\s+/).length >= 5) {
      sentences.push(trimmed);
    }
  }

  return sentences;
}

// ─── Word extraction ─────────────────────────────────────────────────────────

function getSignificantWords(sentence: string): string[] {
  return sentence
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

// ─── Similarity ──────────────────────────────────────────────────────────────

function sentenceSimilarity(s1: string, s2: string): number {
  const words1 = new Set(getSignificantWords(s1));
  const words2 = new Set(getSignificantWords(s2));

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }

  // Normalized overlap (BM25-like)
  return intersection / (Math.log(words1.size + 1) + Math.log(words2.size + 1));
}

// ─── TextRank ────────────────────────────────────────────────────────────────

function textRank(
  sentences: string[],
  iterations: number = 30,
  dampingFactor: number = 0.85,
  topPercent: number = 0.4
): number[] {
  const n = sentences.length;
  if (n === 0) return [];

  // Build similarity matrix
  const similarity: number[][] = Array.from({ length: n }, () =>
    new Array(n).fill(0)
  );

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const sim = sentenceSimilarity(sentences[i], sentences[j]);
      similarity[i][j] = sim;
      similarity[j][i] = sim;
    }
  }

  // Initialize scores
  const scores = new Array(n).fill(1 / n);

  // Run PageRank iterations
  for (let iter = 0; iter < iterations; iter++) {
    const newScores = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const outWeightSum = similarity[j].reduce(
          (acc, val, k) => (k !== j ? acc + val : acc),
          0
        );
        if (outWeightSum > 0) {
          sum += (similarity[j][i] / outWeightSum) * scores[j];
        }
      }
      newScores[i] = (1 - dampingFactor) / n + dampingFactor * sum;
    }

    // Update scores
    for (let i = 0; i < n; i++) {
      scores[i] = newScores[i];
    }
  }

  // Select top sentences by score
  const numToSelect = Math.max(3, Math.ceil(n * topPercent));
  const ranked = scores
    .map((score, idx) => ({ score, idx }))
    .sort((a, b) => b.score - a.score);

  const selectedIndices = ranked
    .slice(0, numToSelect)
    .map((r) => r.idx)
    .sort((a, b) => a - b); // Restore chronological order

  return selectedIndices;
}

// ─── Code block detection ────────────────────────────────────────────────────

interface CodeBlock {
  language: string;
  code: string;
}

function extractCodeBlocks(text: string): {
  codeBlocks: CodeBlock[];
  textWithoutCode: string;
} {
  const codeBlocks: CodeBlock[] = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;

  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    codeBlocks.push({
      language: match[1] || "text",
      code: match[2].trim(),
    });
  }

  const textWithoutCode = text.replace(codeBlockRegex, " [CODE_BLOCK] ").trim();

  return { codeBlocks, textWithoutCode };
}

// ─── Question detection ──────────────────────────────────────────────────────

function isQuestion(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return (
    lower.endsWith("?") ||
    /^(what|how|why|when|where|who|which|can|could|would|should|is|are|do|does|did|will|explain|describe|tell|show)\b/.test(
      lower
    )
  );
}

function extractQuestionHeading(text: string): string {
  // Shorten long questions to a heading
  const cleaned = text.replace(/[?!.]+$/, "").trim();
  const words = cleaned.split(/\s+/);
  if (words.length > 8) {
    return words.slice(0, 8).join(" ") + "…";
  }
  return cleaned;
}

// ─── Topic filtering ─────────────────────────────────────────────────────────

function matchesTopic(sentence: string, topic: string): boolean {
  const lower = sentence.toLowerCase();
  const topicLower = topic.toLowerCase();
  const topicWords = topicLower.split(/\s+/).filter((w) => w.length > 2);

  // Direct substring match
  if (lower.includes(topicLower)) return true;

  // Word-level match (any topic word appears)
  for (const tw of topicWords) {
    if (lower.includes(tw)) return true;
    // Simple stemming: check if sentence contains a word starting with the topic word root
    const root = tw.length > 4 ? tw.slice(0, -2) : tw;
    if (lower.includes(root)) return true;
  }

  return false;
}

// ─── Section break detection ─────────────────────────────────────────────────

function detectSectionBreaks(
  sentences: string[],
  userQuestions: string[]
): { heading: string; startIdx: number }[] {
  const breaks: { heading: string; startIdx: number }[] = [];

  if (sentences.length === 0) return breaks;

  // Add initial section
  if (userQuestions.length > 0) {
    breaks.push({ heading: extractQuestionHeading(userQuestions[0]), startIdx: 0 });
  } else {
    breaks.push({ heading: "Key Concepts", startIdx: 0 });
  }

  // Look for topic shifts by comparing keyword overlap between windows
  const windowSize = 3;
  let questionIdx = 1;

  for (let i = windowSize; i < sentences.length - windowSize; i++) {
    // Get words from preceding and following windows
    const prevWords = new Set(
      sentences
        .slice(Math.max(0, i - windowSize), i)
        .flatMap(getSignificantWords)
    );
    const nextWords = new Set(
      sentences.slice(i, i + windowSize).flatMap(getSignificantWords)
    );

    // Calculate overlap
    let overlap = 0;
    for (const w of prevWords) {
      if (nextWords.has(w)) overlap++;
    }
    const overlapRatio =
      overlap / Math.max(1, Math.min(prevWords.size, nextWords.size));

    // Low overlap = topic shift
    if (overlapRatio < 0.15 && i - (breaks[breaks.length - 1]?.startIdx ?? 0) > 3) {
      if (questionIdx < userQuestions.length) {
        breaks.push({
          heading: extractQuestionHeading(userQuestions[questionIdx]),
          startIdx: i,
        });
        questionIdx++;
      } else {
        breaks.push({
          heading: `Key Point ${breaks.length + 1}`,
          startIdx: i,
        });
      }
    }
  }

  return breaks;
}

// ─── Main extraction ─────────────────────────────────────────────────────────

export function extractNotes(
  turns: ConversationTurn[],
  topic?: string
): string {
  // Collect user questions for potential headings
  const userQuestions: string[] = turns
    .filter((t) => t.role === "user" && isQuestion(t.content))
    .map((t) => t.content);

  // Combine all assistant content
  const assistantText = turns
    .filter((t) => t.role === "assistant")
    .map((t) => t.content)
    .join("\n\n");

  // Extract code blocks before sentence processing
  const { codeBlocks, textWithoutCode } = extractCodeBlocks(assistantText);

  // Tokenize into sentences
  let sentences = tokenizeSentences(textWithoutCode);

  if (sentences.length === 0) {
    // If sentence tokenization failed, use paragraphs
    sentences = textWithoutCode
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 20);
  }

  // Topic filtering
  if (topic && topic.trim()) {
    const filtered = sentences.filter((s) => matchesTopic(s, topic));
    if (filtered.length >= 3) {
      sentences = filtered;
    }
    // If too few match, keep all but note the topic was applied
  }

  // Run TextRank
  const selectedIndices = textRank(sentences, 30, 0.85, 0.45);
  const selectedSentences = selectedIndices.map((i) => sentences[i]);

  // Detect section breaks
  const sections = detectSectionBreaks(selectedSentences, userQuestions);

  // ── Build Markdown ──
  const lines: string[] = [];

  lines.push("# Study Notes");
  lines.push("");

  if (topic) {
    lines.push(`> **Focus topic:** ${topic}`);
    lines.push("");
  }

  lines.push("---");
  lines.push("");

  // Build sections
  if (sections.length === 0) {
    // No sections detected, just list all sentences
    lines.push("## Key Points");
    lines.push("");
    for (const sentence of selectedSentences) {
      lines.push(`- ${sentence}`);
      lines.push("");
    }
  } else {
    for (let s = 0; s < sections.length; s++) {
      const section = sections[s];
      const nextStart =
        s + 1 < sections.length
          ? sections[s + 1].startIdx
          : selectedSentences.length;

      lines.push(`## ${section.heading}`);
      lines.push("");

      const sectionSentences = selectedSentences.slice(
        section.startIdx,
        nextStart
      );

      for (const sentence of sectionSentences) {
        lines.push(`- ${sentence}`);
        lines.push("");
      }
    }
  }

  // Add code blocks section
  if (codeBlocks.length > 0) {
    lines.push("## Code Examples");
    lines.push("");

    for (let i = 0; i < codeBlocks.length; i++) {
      const block = codeBlocks[i];
      if (codeBlocks.length > 1) {
        lines.push(`### Example ${i + 1}`);
        lines.push("");
      }
      lines.push(`\`\`\`${block.language}`);
      lines.push(block.code);
      lines.push("```");
      lines.push("");
    }
  }

  // Summary stats
  lines.push("---");
  lines.push("");
  lines.push(
    `*${selectedSentences.length} key points extracted from ${sentences.length} sentences using TextRank analysis.*`
  );

  return lines.join("\n");
}
