// Import standard React modules
import React from "react";
import Link from "next/link";

// Import our server-side Header component
import Header from "@/components/Header";

// Import Lucide React icons for modern look
import { ArrowLeft, Calendar, Sparkles, AlertCircle } from "lucide-react";

// Import our secure Server Action to retrieve the specific article by slug
import { getPostBySlugAction } from "@/app/actions/posts";

// Import the 'marked' library to securely parse the Markdown body into standard HTML elements
import { marked } from "marked";

// Define a TypeScript interface for the page params.
// params are resolved as Promises in modern Next.js 15+ environments!
interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

/**
 * DYNAMIC METADATA GENERATOR (SEO Best Practice)
 */
export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const result = await getPostBySlugAction(slug);

    if (result.success && result.post) {
        return {
            title: `${result.post.title} | Scryb Blog`,
            description: result.post.body.substring(0, 150).replace(/[#*`_~[\]()]/g, "") + "...",
        };
    }

    return {
        title: "Article Not Found | Scryb",
    };
}

/**
 * ARTICLE DETAIL PAGE (Root Dynamic Route)
 * 
 * Analogy for Beginners:
 * Think of this page like a custom gallery viewer at the root desk.
 * Instead of routing you to a separate department (/posts/my-story),
 * we serve the document directly in the main lobby (/[slug]), formatting the markdown
 * securely into beautiful theme-compatible styles.
 */
export default async function PostDetailPage({ params }: PageProps) {
    // 1. Resolve route parameters to extract the current post's slug
    const { slug } = await params;

    // 2. Fetch the target article details from Django using our server action
    const result = await getPostBySlugAction(slug);
    const post = result.post;

    // 3. Helper utility to format timestamps elegantly
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // 4. Handle Case: If the article does not exist or fetch failed, render a beautiful 404 state
    if (!result.success || !post) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between font-sans">
                <Header />
                <main className="flex-1 w-full max-w-xl mx-auto px-6 py-24 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-12 h-12 text-zinc-450 dark:text-zinc-600 mb-4" />
                    <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Article Not Found</h1>
                    <p className="text-zinc-650 dark:text-zinc-400 text-sm mb-8 max-w-sm">
                        We searched high and low but couldn't find an article matching that slug. It may have been retired or reverted to a draft.
                    </p>
                    <Link 
                        href="/" 
                        className="h-10 px-5 rounded-full bg-[#FF5A36] hover:bg-[#E04F2F] text-white font-semibold text-xs transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Home Feed
                    </Link>
                </main>
                <footer className="w-full max-w-6xl mx-auto px-6 py-8 text-center text-xs text-zinc-450 dark:text-zinc-550 border-t border-zinc-200/50 dark:border-zinc-800/50">
                    <p>&copy; {new Date().getFullYear()} Staqed Projects.</p>
                </footer>
            </div>
        );
    }

    // 5. Parse Markdown safely into structured HTML using marked
    const rawHtml = await marked.parse(post.body || "");

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between font-sans transition-colors duration-300">
            {/* Header navbar containing active sessions */}
            <Header />

            {/* MAIN ARTICLE LAYOUT CONTAINER */}
            <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
                
                {/* Back to Home Button Link */}
                <div className="mb-10">
                    <Link 
                        href="/" 
                        className="group inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-450 dark:hover:text-white transition-colors duration-250"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
                        <span>Back to Home Feed</span>
                    </Link>
                </div>

                {/* Main Article Section */}
                <article className="space-y-6">
                    <header className="space-y-4 pb-8 border-b border-zinc-200/60 dark:border-zinc-850">
                        {/* Glow Published Category Badge */}
                        <div className="inline-flex items-center gap-1.5 bg-[#FF5A36]/10 text-[#FF5A36] px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                            <Sparkles className="w-3 h-3 text-[#FF5A36]" />
                            <span>Published Story</span>
                        </div>

                        {/* Title Display */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
                            {post.title}
                        </h1>

                        {/* Author profile & created timestamp */}
                        <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#FF5A36]/10 text-[#FF5A36] dark:bg-[#FF5A36]/20 flex items-center justify-center text-[10px] font-black shadow-sm">
                                    {post.user?.full_name ? post.user.full_name[0].toUpperCase() : "A"}
                                </div>
                                <span className="text-zinc-800 dark:text-zinc-250 font-bold">
                                    {post.user?.full_name || "Anonymous Author"}
                                </span>
                            </div>

                            <span className="hidden sm:inline w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />

                            <span className="flex items-center gap-1.5 text-zinc-450">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(post.created_at)}
                            </span>
                        </div>
                    </header>

                    {/* Parsed Markdown HTML with custom CSS layout styling */}
                    <div 
                        className="markdown-content pt-4 pb-12"
                        dangerouslySetInnerHTML={{ __html: rawHtml }} 
                    />
                </article>
            </main>

            {/* Standard Footer layout containing staqed references */}
            <footer className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-200/50 dark:border-zinc-800/50">
                <p>&copy; {new Date().getFullYear()} Staqed Projects. Read fully on <a href="https://staqed.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-900 dark:hover:text-white transition-colors">staqed.com</a>.</p>
                <p className="mt-2 sm:mt-0 font-medium">Aesthetically crafted in 2026.</p>
            </footer>
        </div>
    );
}
