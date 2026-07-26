import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface PreviewPaneProps {
  title: string;
  author: string;
  extractedMarkdown: string;
}

export function PreviewPane({ title, author, extractedMarkdown }: PreviewPaneProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex-1 bg-white brutal-border brutal-shadow-static">
      {/* Document Header */}
      <div className="border-b-[6px] border-black p-8 sm:p-12 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex-1">
          <h2 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
            {title || "Document Title"}
          </h2>
          <div className="flex flex-col gap-2 text-xl font-bold uppercase text-gray-600">
            <div>
              <span className="text-black mr-3">AUTHOR:</span> 
              {author || "Anonymous"}
            </div>
            <div>
              <span className="text-black mr-3">DATE:</span> 
              {currentDate}
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <div className="w-32 h-32 sm:w-40 sm:h-40 border-8 border-black bg-white flex items-center justify-center p-2 transform rotate-3">
            <span className="text-3xl sm:text-4xl font-black uppercase text-center leading-none">
              Chat<br/>Notes<br/>Gen
            </span>
          </div>
        </div>
      </div>
      
      {/* Document Body */}
      <div className="p-8 sm:p-12 prose prose-lg sm:prose-xl max-w-none 
          prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-black
          prose-h1:text-5xl prose-h1:mb-8 prose-h1:pb-4 prose-h1:border-b-8 prose-h1:border-black
          prose-h2:text-4xl prose-h2:mt-12 prose-h2:mb-6
          prose-h3:text-3xl prose-h3:mt-8
          prose-p:font-medium prose-p:text-xl prose-p:leading-relaxed prose-p:mb-8
          prose-a:text-[#ff00ff] prose-a:font-bold prose-a:underline prose-a:decoration-4 prose-a:underline-offset-4 hover:prose-a:text-black
          prose-strong:font-black
          prose-ul:list-square prose-ul:pl-8
          prose-li:text-xl prose-li:font-medium prose-li:mb-3 prose-li:marker:text-black
          prose-blockquote:border-l-8 prose-blockquote:border-black prose-blockquote:bg-gray-50 prose-blockquote:px-8 prose-blockquote:py-6 prose-blockquote:font-bold prose-blockquote:text-2xl prose-blockquote:not-italic
          prose-pre:border-4 prose-pre:border-black prose-pre:rounded-none prose-pre:bg-gray-900 prose-pre:shadow-[8px_8px_0_rgba(0,0,0,1)]
          prose-code:font-mono prose-code:font-bold prose-code:text-[#ff00ff] prose-code:before:content-none prose-code:after:content-none
          prose-img:border-8 prose-img:border-black prose-img:shadow-[12px_12px_0_rgba(0,0,0,1)] prose-img:my-12
          prose-hr:border-t-[6px] prose-hr:border-black prose-hr:my-12"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {extractedMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
