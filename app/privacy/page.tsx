"use client";

export default function PrivacyPage() {
  return (
    <main className="flex-1 w-[95%] mx-auto pt-16 sm:pt-24 pb-20 max-w-4xl">
      <div className="brutal-border brutal-shadow-static bg-white p-8 sm:p-12">
        <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter mb-12 border-b-8 border-black pb-6">
          Privacy Policy
        </h1>
        
        <div className="prose prose-xl prose-headings:font-black prose-headings:uppercase prose-p:font-semibold max-w-none">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you use our services. 
            This includes the URLs you submit for processing, your account details (if logged in), and any communications you send to us.
          </p>

          <h2>2. How We Use Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide, maintain, and improve our services.</li>
            <li>Process and complete transactions.</li>
            <li>Send you technical notices and support messages.</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            We do not share your personal information or the content you generate with third parties, except as described in this policy (e.g., with third-party service providers who assist us in operating our services).
          </p>

          <h2>4. Security</h2>
          <p>
            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
          </p>
        </div>
      </div>
    </main>
  );
}
