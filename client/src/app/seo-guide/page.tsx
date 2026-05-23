import type { Metadata } from "next";
import Link from "next/link";

const title = "SEO Guide for Pulse Chat | Google Search Console, Content SEO, and AI Optimization";
const description =
  "Learn how to set up Google Search Console, improve technical SEO, write content that ranks, optimize images, build backlinks, and use AI SEO prompts.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "SEO",
    "Google Search Console",
    "technical SEO",
    "content SEO",
    "AI SEO",
    "schema markup",
    "sitemap",
    "robots.txt",
  ],
  alternates: {
    canonical: "/seo-guide",
  },
  openGraph: {
    title,
    description,
    url: "/seo-guide",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const checklist = [
  "Sitemap submitted",
  "Mobile optimized",
  "HTTPS enabled",
  "Fast loading",
  "Metadata added",
  "Proper headings used",
  "Internal links added",
  "Images optimized",
];

const technicalSeo = [
  "Fast loading speed",
  "Mobile responsiveness",
  "HTTPS enabled",
  "Clean URLs",
  "Proper metadata",
  "Robots.txt and sitemap setup",
];

const backlinks = [
  "Blogs and guest posts",
  "Social sharing",
  "Product Hunt launches",
  "Directories",
  "Useful tools and resources",
];

const aiSeoPrompt = `You are an advanced SEO analyst, technical SEO engineer, conversion copywriter, semantic search optimizer, and Google ranking specialist. Analyze my complete website thoroughly.

Tasks:
- Analyze all pages
- Find high-ranking SEO keywords
- Generate SEO optimized headings and content
- Improve semantic relevance
- Suggest internal links
- Suggest schema markup
- Optimize readability
- Detect weak sections
- Improve technical SEO
- Rewrite AI-generic copy
- Generate metadata
- Suggest blog ideas
- Prioritize fixes by impact

Output:
- SEO audit summary
- Critical issues
- Keyword opportunities
- Technical SEO improvements
- Content improvements
- Final SEO score`;

export default function SeoGuidePage() {
  return (
    <main className="min-h-screen bg-(--bg-primary) text-white">
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="max-w-3xl space-y-6">
          <p className="inline-flex rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-(--text-secondary)">
            SEO Guide
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            SEO setup, content strategy, and AI optimization for Pulse Chat
          </h1>
          <p className="text-lg md:text-xl text-(--text-secondary) leading-relaxed">
            This guide covers Google Search Console setup, technical SEO, content SEO, image optimization,
            backlink ideas, and a practical AI prompt you can reuse for future audits.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <article className="glass-panel rounded-3xl border border-(--border) p-6 md:p-10 space-y-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">What is SEO?</h2>
              <p className="text-(--text-secondary) leading-relaxed">
                SEO, or Search Engine Optimization, helps search engines understand, trust, and rank your
                website higher in search results.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Google Search Console Setup</h2>
              <ol className="list-decimal space-y-2 pl-6 text-(--text-secondary)">
                <li>Open Google Search Console.</li>
                <li>Add your domain or property.</li>
                <li>Verify ownership using DNS or HTML methods.</li>
                <li>Submit your sitemap.xml.</li>
                <li>Monitor indexing and keyword performance.</li>
              </ol>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Technical SEO Essentials</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {technicalSeo.map((item) => (
                  <li key={item} className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-(--text-secondary)">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Content SEO</h2>
              <p className="text-(--text-secondary) leading-relaxed">
                Write useful content that matches user intent. Use natural keywords, proper heading hierarchy,
                internal linking, and optimized meta descriptions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Image SEO</h2>
              <p className="text-(--text-secondary) leading-relaxed">
                Use compressed images, meaningful filenames, alt text, and responsive image sizing.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Backlinks</h2>
              <ul className="list-disc space-y-2 pl-6 text-(--text-secondary)">
                {backlinks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Modern SEO for AI Websites</h2>
              <p className="text-(--text-secondary) leading-relaxed">
                Avoid generic AI-generated copy. Focus on semantic HTML, accessibility, fast performance,
                structured data, and trustworthy content.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">AI SEO Optimization Prompt</h2>
              <p className="text-(--text-secondary) leading-relaxed">
                Use this prompt with ChatGPT, Claude, Gemini, Cursor, Windsurf, or any other AI tool.
              </p>
              <pre className="overflow-x-auto rounded-2xl border border-(--border) bg-black/30 p-4 text-sm leading-relaxed text-(--text-secondary)">
                {aiSeoPrompt}
              </pre>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">SEO Checklist</h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {checklist.map((item) => (
                  <li key={item} className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-(--text-secondary)">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Final Advice</h2>
              <p className="text-(--text-secondary) leading-relaxed">
                SEO is a long-term game. Focus on useful content, fast performance, strong branding, technical
                optimization, and consistent publishing.
              </p>
            </section>
          </article>

          <aside className="space-y-6">
            <div className="glass-panel rounded-3xl border border-(--border) p-6 space-y-4">
              <h2 className="text-xl font-bold">Quick Wins</h2>
              <ul className="space-y-2 text-(--text-secondary)">
                <li>• Add a unique title and description to every page.</li>
                <li>• Make sure the homepage and guide page are indexable.</li>
                <li>• Link to this guide from the homepage footer.</li>
                <li>• Keep copy useful, specific, and updated.</li>
              </ul>
            </div>

            <div className="glass-panel rounded-3xl border border-(--border) p-6 space-y-4">
              <h2 className="text-xl font-bold">Next Steps</h2>
              <p className="text-(--text-secondary) leading-relaxed">
                If you want, I can also turn this into a blog post, add schema markup, or build an SEO audit
                checklist inside the app admin area.
              </p>
              <Link href="/" className="inline-flex rounded-full bg-gradient px-5 py-3 font-semibold text-white transition-opacity hover:opacity-90">
                Back to Home
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}