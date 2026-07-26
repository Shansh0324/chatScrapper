import { Link2, Search, ClipboardList } from "lucide-react";

export function HowItWorks() {
  return (
    <div id="how-it-works" className="animate-fade-in-up delay-200">
      <h2 className="text-4xl sm:text-5xl font-black text-center uppercase tracking-wide mb-12">
        HOW CHATNOTES WORKS
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1 */}
        <div className="brutal-border brutal-shadow-static bg-white p-6 sm:p-8 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-black text-white w-12 h-12 flex items-center justify-center text-2xl font-black shrink-0">
              1.
            </div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase">PASTE URL</h3>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <Link2 className="w-20 h-20 mb-8 stroke-[3]" />
            <p className="text-xl sm:text-2xl font-semibold leading-snug">
              Copy the URL of any web page, article, or video link into the input box above.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="brutal-border brutal-shadow-static bg-white p-6 sm:p-8 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-black text-white w-12 h-12 flex items-center justify-center text-2xl font-black shrink-0">
              2.
            </div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase">ANALYZE</h3>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <Search className="w-20 h-20 mb-8 stroke-[3]" />
            <p className="text-xl sm:text-2xl font-semibold leading-snug">
              ChatNotes processes the content using advanced AI to capture key insights and details.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="brutal-border brutal-shadow-static bg-white p-6 sm:p-8 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-black text-white w-12 h-12 flex items-center justify-center text-2xl font-black shrink-0">
              3.
            </div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase">GET NOTES</h3>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <ClipboardList className="w-20 h-20 mb-8 stroke-[3]" />
            <p className="text-xl sm:text-2xl font-semibold leading-snug">
              Receive concise, organized, and structured notes and summaries instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
