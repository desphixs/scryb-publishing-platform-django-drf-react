// Import React standard modules
import React from "react";
// Import Next.js navigation linkages
import Link from "next/link";
// Import next-navigation redirects for not-found edge cases
import { redirect } from "next/navigation";

// Import our master dashboard layout wrapper
import DashboardWrapper from "@/components/dashboard/DashboardWrapper";

// Import beautiful icons from Lucide React
import { AlertCircle, ArrowLeft, PenSquare } from "lucide-react";

// Import our secure Server Action to fetch the existing post details from Django by its slug
import { getPostBySlugAction } from "@/app/actions/posts";

// Import our newly created interactive EditPostForm client component
import EditPostForm from "./EditPostForm";

// Define a type-safe TypeScript interface to capture route dynamic parameters
interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

/**
 * EDIT ARTICLE DYNAMIC PAGE (Server Component)
 * 
 * Analogy for Beginners:
 * Think of this page like a high-security reading desk inside the private archives.
 * When an author requests to edit a file (e.g. dashboard/posts/my-story/edit),
 * the archivist (this Server Component) immediately fetches the original document (getPostBySlugAction)
 * from the database vault behind the scenes.
 * 
 * If found, the archivist hands the original pages down to the author's typewriter table
 * (the EditPostForm client component) so they can make direct amendments.
 */
export default async function EditPostPage({ params }: PageProps) {
    // 1. Resolve the asynchronous dynamic route parameters promise to capture the slug
    const { slug } = await params;

    // 2. Fetch the target post details from the Django backend
    const result = await getPostBySlugAction(slug);
    const post = result.post;

    // 3. Handle Case: If the article does not exist or fetch failed, render a beautiful 404 block
    if (!result.success || !post) {
        return (
            <DashboardWrapper>
                <div className="max-w-xl mx-auto py-16 flex flex-col items-center justify-center text-center space-y-6">
                    <AlertCircle className="w-12 h-12 text-zinc-400 dark:text-zinc-650" />
                    <div>
                        <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white">
                            Article Not Found
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            We couldn't locate any article matching the slug <code className="font-mono text-red-500 bg-red-50 dark:bg-red-950/20 px-1 py-0.5 rounded">{slug}</code>.
                        </p>
                    </div>
                    <Link 
                        href="/dashboard"
                        className="h-10 px-5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-750 dark:text-zinc-300 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                    >
                        <ArrowLeft size={14} />
                        Back to Overview
                    </Link>
                </div>
            </DashboardWrapper>
        );
    }

    return (
        <DashboardWrapper>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
                
                {/* Header Row */}
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                    <div className="flex items-center gap-3">
                        <Link 
                            href="/dashboard"
                            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            aria-label="Go Back to Dashboard"
                        >
                            <ArrowLeft size={16} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-extrabold text-zinc-950 dark:text-white">
                                Edit Article Details
                            </h1>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Revise title, edit body content, toggle publishing privacy, or delete the post.
                            </p>
                        </div>
                    </div>

                    {/* Category indicator badge */}
                    <div className="inline-flex items-center gap-1.5 bg-[#FF5A36]/10 text-[#FF5A36] px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                        <PenSquare className="w-3.5 h-3.5" />
                        <span>Edit Console</span>
                    </div>
                </div>

                {/* Render the interactive client form pre-filled with the database post details */}
                <EditPostForm post={post} />

            </div>
        </DashboardWrapper>
    );
}
