"use client";



export default function ContactPage() {
  return (
    <main className="flex-1 w-[95%] mx-auto pt-16 sm:pt-24 pb-20 flex items-center justify-center">
      <div className="w-full max-w-2xl brutal-border brutal-shadow-static bg-white p-8 sm:p-12">
        <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter mb-8 border-b-8 border-black pb-4">
          Contact Us
        </h1>
        <p className="text-2xl mb-12 font-semibold">
          Have a question, feedback, or a partnership inquiry? Drop us a line below.
        </p>
        
        <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex flex-col gap-3">
              <label className="text-2xl font-black uppercase">Name</label>
              <input 
                type="text" 
                placeholder="John Doe"
                className="w-full px-5 py-4 brutal-border text-xl font-bold outline-none focus:outline focus:outline-4 focus:outline-[#ff00ff] bg-gray-50"
                required
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-2xl font-black uppercase">Email</label>
              <input 
                type="email" 
                placeholder="you@example.com"
                className="w-full px-5 py-4 brutal-border text-xl font-bold outline-none focus:outline focus:outline-4 focus:outline-[#ff00ff] bg-gray-50"
                required
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <label className="text-2xl font-black uppercase">Message</label>
            <textarea 
              rows={5}
              placeholder="What's on your mind?"
              className="w-full px-5 py-4 brutal-border text-xl font-bold outline-none focus:outline focus:outline-4 focus:outline-[#ff00ff] bg-gray-50 resize-y"
              required
            />
          </div>
          
          <button 
            type="submit"
            className="mt-4 w-full py-6 brutal-border brutal-shadow-sm-static bg-black hover:bg-gray-800 text-white text-3xl font-black uppercase transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none"
          >
            Send Message
          </button>
        </form>
      </div>
    </main>
  );
}
