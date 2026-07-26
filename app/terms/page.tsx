"use client";

export default function TermsPage() {
  return (
    <main className="flex-1 w-[95%] mx-auto pt-16 sm:pt-24 pb-20 max-w-4xl">
      <div className="brutal-border brutal-shadow-static bg-white p-8 sm:p-12">
        <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter mb-12 border-b-8 border-black pb-6">
          Terms of Service
        </h1>
        
        <div className="prose prose-xl prose-headings:font-black prose-headings:uppercase prose-p:font-semibold max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using ChatNotes, you accept and agree to be bound by the terms and provision of this agreement. 
            In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            ChatNotes provides users with tools to extract and summarize content from various web sources. 
            We are not responsible for the original content that is extracted, nor for any inaccuracies in the AI-generated summaries.
          </p>

          <h2>3. User Conduct</h2>
          <p>
            You agree to not use the Service to:
          </p>
          <ul>
            <li>Extract content from illegal or unauthorized sources.</li>
            <li>Violate any local, state, national, or international law.</li>
            <li>Interfere with or disrupt the Service or servers.</li>
          </ul>

          <h2>4. Modification of Terms</h2>
          <p>
            We reserve the right to change these conditions from time to time as we see fit and your continued use of the site will signify your acceptance of any adjustment to these terms.
          </p>
        </div>
      </div>
    </main>
  );
}
