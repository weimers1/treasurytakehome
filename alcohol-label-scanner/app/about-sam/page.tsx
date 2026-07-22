import { User, Rocket, Link as LinkIcon, ExternalLink, Zap, Code } from "lucide-react";

export default function AboutSamPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900 px-8 py-12 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <User className="h-10 w-10 text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">About Sam</h1>
            <p className="text-zinc-400 text-lg max-w-xl italic">
              "Building fast, scalable, cloud-native web applications with clean user experiences."
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        {/* About Me Section */}
        <section className="group bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <Code className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">About Me</h2>
          </div>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Hi, I'm Sam Weimer. I'm a Full-Stack Engineer with around 5 years of experience architecting and building fast, scalable, cloud-native web applications. I hold a B.S. in Computer Science from Binghamton University and spend my time building production software, exploring modern architecture patterns, and turning technical challenges into clean user experiences.
          </p>
        </section>

        {/* About This Project Section */}
        <section className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
              <Rocket className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">About This Project</h2>
          </div>
          
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
            This application was built as a practical demonstration of integrating real-time AI tools into enterprise workflows—specifically for automated regulatory compliance and verification against federal <b>TTB (Alcohol and Tobacco Tax and Trade Bureau)</b> labeling standards.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Key Technical Highlights
          </h3>

          <div className="grid gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold">1</div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Modern Full-Stack Foundation</h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">Built end-to-end with <b>Next.js (App Router)</b>, <b>TypeScript</b>, <b>Tailwind CSS</b>, and <b>MUI</b>, designed as a single, lightweight containerized application for maximum performance and zero network overhead.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold">2</div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Multimodal AI Vision</h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">Leverages <b>Gemini 3.1 Flash Lite</b> for rapid, high-accuracy OCR text extraction across complex, styled alcohol bottle labels.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold">3</div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">In-Memory Deterministic Validation</h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">Combines AI-extracted evidence with strict regulatory rule checks (fuzzy string matching, ABV percentage tolerances, and mandatory federal Government Warning detection) running in milliseconds.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold">4</div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Performance Optimization</h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">Built for speed—using client-side image compression to shrink uploads from multi-megabyte photos down to lightweight payloads, ensuring sub-4-second end-to-end evaluation speeds.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold">5</div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Cloud-Native & Serverless</h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">Fully containerized via <b>Docker</b> and deployed serverless on <b>Google Cloud Run</b> for auto-scaling and high availability.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Links & Portfolio Section */}
        <section className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-inner">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              <LinkIcon className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Links & Portfolio</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <a 
              href="https://samweimer.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-sm"
            >
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Portfolio</span>
              <ExternalLink className="h-4 w-4 text-zinc-400" />
            </a>
            
            <a 
              href="https://github.com/weimers1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-white transition-all hover:shadow-sm"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">GitHub</span>
              </div>
              <ExternalLink className="h-4 w-4 text-zinc-400" />
            </a>

            <a 
              href="https://linkedin.com/in/sam-weimer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-blue-600 transition-all hover:shadow-sm"
            >
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">LinkedIn</span>
              </div>
              <ExternalLink className="h-4 w-4 text-zinc-400" />
            </a>
          </div>

          <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-500 text-center italic">
            This Alcohol Label Scanner is a take-home project designed to demonstrate full-stack capabilities with Next.js and AI integration.
          </p>
        </section>
      </div>
    </div>
  );
}
