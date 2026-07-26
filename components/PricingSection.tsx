"use client";

export function PricingSection() {
  return (
    <section id="pricing" className="w-[95%] mx-auto py-20 max-w-7xl">
      <div className="text-center mb-16">
        <h2 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
          Pricing
        </h2>
        <p className="text-2xl text-gray-600 font-semibold max-w-3xl mx-auto">
          Simple, transparent pricing. Turn your AI chats into beautiful study notes in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Free Tier */}
        <div className="brutal-border brutal-shadow-static bg-white p-8 sm:p-12 flex flex-col">
          <h3 className="text-4xl font-black uppercase mb-4">Basic</h3>
          <div className="text-6xl font-black mb-8">₹0<span className="text-2xl text-gray-500">/mo</span></div>
          <ul className="space-y-4 mb-12 flex-1">
            <li className="flex items-center text-xl font-bold gap-3">
              <span className="text-[#ff00ff]">●</span> Up to 5 Notes/month
            </li>
            <li className="flex items-center text-xl font-bold gap-3">
              <span className="text-[#ff00ff]">●</span> Works with any AI Chat
            </li>
            <li className="flex items-center text-xl font-bold gap-3">
              <span className="text-[#ff00ff]">●</span> Standard PDF Export
            </li>
            <li className="flex items-center text-xl font-bold gap-3 opacity-50">
              <span className="text-gray-400">●</span> Custom Themes (Pro)
            </li>
          </ul>
          <button className="w-full py-4 brutal-border bg-gray-100 hover:bg-gray-200 text-xl font-black uppercase transition-colors">
            Get Started
          </button>
        </div>

        {/* Pro Tier */}
        <div className="brutal-border brutal-shadow-static bg-[#ff00ff] text-white p-8 sm:p-12 flex flex-col relative transform md:-translate-y-4">
          <div className="absolute top-0 right-0 bg-black text-white px-4 py-2 font-black uppercase text-sm brutal-border border-white m-4">
            Most Popular
          </div>
          <h3 className="text-4xl font-black uppercase mb-4">Pro</h3>
          <div className="text-6xl font-black mb-8">₹99<span className="text-2xl text-white/70">/mo</span></div>
          <ul className="space-y-4 mb-12 flex-1">
            <li className="flex items-center text-xl font-bold gap-3">
              <span className="text-black">●</span> Unlimited Notes
            </li>
            <li className="flex items-center text-xl font-bold gap-3">
              <span className="text-black">●</span> Priority Support
            </li>
            <li className="flex items-center text-xl font-bold gap-3">
              <span className="text-black">●</span> Advanced PDF Customization
            </li>
            <li className="flex items-center text-xl font-bold gap-3">
              <span className="text-black">●</span> Custom Themes & Fonts
            </li>
          </ul>
          <button className="w-full py-4 brutal-border bg-black text-white hover:bg-gray-800 text-xl font-black uppercase transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none shadow-[4px_4px_0_rgba(255,255,255,1)]">
            Subscribe Now
          </button>
        </div>
      </div>
    </section>
  );
}
