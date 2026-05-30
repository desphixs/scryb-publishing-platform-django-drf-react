// Import standard React modules
import React from "react";
import Link from "next/link";

// Import our server-side Header component to manage authentication nav links
import Header from "@/components/Header";

// Import beautiful, clean icons from Lucide React
import { Calendar, User, ArrowRight, Sparkles, BookOpen } from "lucide-react";

// Import our secure Server Action that pulls the list of published posts from Django
import { getPublishedPostsAction } from "@/app/actions/posts";

/**
 * HOME PAGE (Server Component)
 *
 * Analogy for Beginners:
 * Think of this page like the main lobby of a modern publishing house ("Scryb").
 * Instead of showing a static welcome poster, we immediately display our primary book stand
 * (the list of published articles) so that visitors can start reading right away.
 *
 * Because it's a Server Component, all database queries to Django happen in the background
 * before the user even receives the webpage, making it load instantly!
 */
export default async function Home() {
    // 1. Fetch our public articles directly from Django during page pre-rendering
    const result = await getPublishedPostsAction();
    const posts = result.success ? result.posts : [];

    // 2. Helper utility to format raw timestamp strings into elegant editorial dates
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between font-sans transition-colors duration-300">
            {/* Render our top-level smart navigation header */}
            <Header />

            {/* MAIN CENTRAL CONTENT FEED */}
            <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-16">
                {/* Minimalist, Elegant Hero Section */}
                <div className="max-w-3xl mb-16 space-y-4">
                    {/* Main editorial header */}
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
                        Insights & Stories from <span className="bg-gradient-to-r from-[#FF5A36] to-[#E04F2F] bg-clip-text text-transparent">Scryb</span>
                    </h1>

                    {/* Minimalist description */}
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm sm:text-base">
                        Explore tutorials, architectural blueprints, and engineering thoughts built by our community. <br /> Created for master learning on{" "}
                        <a href="https://staqed.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-950 dark:hover:text-white font-medium transition-colors">
                            staqed.com
                        </a>
                        .
                    </p>
                </div>

                {/* ERROR NOTIFICATION BLOCK (Failsafe) */}
                {!result.success && (
                    <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm mb-8">
                        <p className="font-bold mb-1">Could not connect to Django API</p>
                        <p>{result.message}</p>
                    </div>
                )}

                {posts.length === 0 ? (
                    // Aesthetic empty state layout
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-150/10 dark:border-zinc-800/40 rounded-3xl p-8 shadow-sm">
                        <BookOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-750 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">No articles published yet</h3>
                        <p className="text-zinc-500 text-sm max-w-sm mx-auto">Check back soon! Our writers are cooking up some highly detailed technical deep-dives.</p>
                    </div>
                ) : (
                    // Multi-column cards grid layout
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post: any) => {
                            // 3. Simple regex cleanup to strip markdown symbols for card excerpt
                            const plainTextBody = post.body.replace(/[#*`_~[\]()]/g, "").substring(0, 140);
                            const excerpt = plainTextBody.length >= 140 ? `${plainTextBody}...` : plainTextBody;

                            return (
                                <Link
                                    key={post.id}
                                    href={`/${post.slug}`} // Direct slug routing! No /posts prefix!
                                    className="group flex flex-col justify-between p-6 bg-white dark:bg-zinc-900/45 border border-zinc-205/60 dark:border-zinc-800/50 hover:border-[#FF5A36] dark:hover:border-[#FF5A36] rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <div>
                                        {/* Card Title */}
                                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2.5 group-hover:text-[#FF5A36] dark:group-hover:text-[#FF5A36] transition-colors">{post.title}</h2>

                                        {/* Article Excerpt */}
                                        <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">{excerpt}</p>
                                    </div>

                                    {/* Card Metadata Footer */}
                                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                                        {/* Left: Author Initials */}
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-zinc-95 bg-[#FF5A36]/10 text-[#FF5A36] dark:bg-[#FF5A36]/20 flex items-center justify-center text-[9px] font-black">{post.user?.full_name ? post.user.full_name[0].toUpperCase() : "A"}</div>
                                            <span className="truncate max-w-[100px]">{post.user?.full_name || "Anonymous Author"}</span>
                                        </div>

                                        {/* Right: Date Timestamp */}
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 text-zinc-400">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(post.created_at)}
                                            </span>

                                            {/* Micro-arrow indicator shifting right on card hover */}
                                            <ArrowRight className="w-3.5 h-3.5 text-zinc-450 group-hover:text-[#FF5A36] group-hover:translate-x-1 transition-all duration-200" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Standard minimalist page footer */}
            <footer className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-200/50 dark:border-zinc-800/50">
                <p>&copy; {new Date().getFullYear()} Staqed Projects. All rights reserved.</p>
                <p className="mt-2 sm:mt-0 font-medium">Built for master full-stack learners.</p>
            </footer>
        </div>
    );
}
