"use client";

// Import React and standard state management hooks
import React, { useState } from "react";
// Import Next.js client-side navigation hook for redirects and route history
import { useRouter } from "next/navigation";

// Import our master dashboard layout wrapper to keep the design unified
import DashboardWrapper from "@/components/dashboard/DashboardWrapper";

// Import beautiful, clean icons from Lucide React
import { PenSquare, Sparkles, ArrowLeft, Loader2, Save } from "lucide-react";

// Import our secure Server Action to send the new article data to Django
import { createPostAction } from "@/app/actions/posts";

/**
 * NEW ARTICLE CREATION WORKSPACE (Client Component)
 * 
 * Analogy for Beginners:
 * Think of this page like a fresh, blank sheet of paper in a high-end writing studio.
 * - The state variables (title, body, status) act like temporary memory buffers
 *   holding the ink before we seal the envelope.
 * - When you click "Publish", the studio courier (createPostAction Server Action) takes
 *   the finalized manuscript, flies it over to our secure vault (Django backend),
 *   stamps it onto a permanent shelf, and returns with the official book address (slug)
 *   so the writer can view the final printed version.
 */
export default function NewPostPage() {
    const router = useRouter();

    // 1. Establish state variables to track form inputs and submissions
    const [title, setTitle] = useState(""); // Stores active title text input
    const [body, setBody] = useState(""); // Stores raw Markdown body content
    const [status, setStatus] = useState("draft"); // Stores publish status choice ('draft' or 'published')
    
    const [isLoading, setIsLoading] = useState(false); // Controls loading indicators during active API calls
    const [errorMsg, setErrorMsg] = useState<string | null>(null); // Captures validation or connection errors

    // 2. Form submission handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Block default browser page-reload behavior on form submit

        // Reset any existing error messages before starting a new request
        setErrorMsg(null);

        // Simple validation: Block submissions if title or body is completely blank
        if (!title.trim()) {
            setErrorMsg("Please enter a title for your article.");
            return;
        }
        if (!body.trim()) {
            setErrorMsg("Please write some content inside your article body.");
            return;
        }

        // Trigger active loading state to disable buttons and show progress spinner
        setIsLoading(true);

        try {
            // Invoke our secure Server Action, passing the title, body, and status choice
            const result = await createPostAction({
                title: title.trim(),
                body: body.trim(),
                status: status,
            });

            if (result.success && result.post) {
                // Reroute the user instantly to the newly created article's root URL slug!
                // Next.js client-side router redirects in a smooth single page application sweep.
                router.push(`/${result.post.slug}`);
            } else {
                // If Django returns a validation error (e.g. duplicate slug), capture the message
                setErrorMsg(result.message || "Failed to save the article. Please check your inputs.");
                setIsLoading(false); // Enable form editing again
            }
        } catch (error: any) {
            // Capture unexpected connection drops
            setErrorMsg(error.message || "An unexpected error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <DashboardWrapper>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
                
                {/* Back to Overview Row */}
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => router.back()}
                            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors"
                            aria-label="Go Back"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 className="text-xl font-extrabold text-zinc-950 dark:text-white">
                                Write New Article
                            </h1>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Draft, format with Markdown, and publish to your home feed.
                            </p>
                        </div>
                    </div>

                    {/* Glowing active indicator badge */}
                    <div className="inline-flex items-center gap-1.5 bg-[#FF5A36]/10 text-[#FF5A36] px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                        <PenSquare className="w-3.5 h-3.5" />
                        <span>Interactive Editor</span>
                    </div>
                </div>

                {/* ERROR FEEDBACK BANNER */}
                {errorMsg && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold animate-in slide-in-from-top-1 duration-200">
                        {errorMsg}
                    </div>
                )}

                {/* MAIN WRITING WORKSPACE FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Title & Status Settings Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 p-4 rounded-2xl">
                        
                        {/* Title Text Area */}
                        <div className="flex-1 w-full">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Article Title..."
                                className="w-full text-xl sm:text-2xl font-black bg-transparent border-none focus:outline-none focus:ring-0 text-zinc-950 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-700"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {/* Status Select dropdown */}
                        <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest shrink-0">
                                Status:
                            </span>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="text-xs font-bold border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-350 focus:outline-none focus:ring-0 cursor-pointer shadow-sm"
                                disabled={isLoading}
                            >
                                <option value="draft">Draft (Private)</option>
                                <option value="published">Published (Public)</option>
                            </select>
                        </div>
                    </div>

                    {/* Markdown Editor Canvas Body */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 shadow-sm">
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                            Markdown Body Content
                        </span>
                        
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Write your article body content here using Markdown formatting (e.g. ## Heading, *italic*, **bold**)..."
                            className="w-full min-h-[400px] bg-transparent resize-y border-none focus:outline-none focus:ring-0 text-zinc-800 dark:text-zinc-200 font-mono text-sm leading-relaxed placeholder-zinc-300 dark:placeholder-zinc-700"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="h-11 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-750 dark:text-zinc-300 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        
                        <button
                            type="submit"
                            className="h-11 px-6 rounded-xl bg-[#FF5A36] hover:bg-[#E04F2F] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Saving Draft...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Publish Article</span>
                                </>
                            )}
                        </button>
                    </div>

                </form>

            </div>
        </DashboardWrapper>
    );
}
