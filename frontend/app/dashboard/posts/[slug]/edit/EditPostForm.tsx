"use client";

// Import React and standard state management hooks
import React, { useState } from "react";
// Import Next.js client-side navigation hook for redirecting
import { useRouter } from "next/navigation";

// Import Lucide React icons for elegant UI design
import { Save, Trash2, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

// Import our secure Server Actions to update and delete articles
import { updatePostAction, deletePostAction } from "@/app/actions/posts";

// Define a type-safe TypeScript interface to declare that this component expects a "post" object
interface EditPostFormProps {
    post: {
        id: number;
        title: string;
        slug: string;
        body: string;
        status: string;
    };
}

/**
 * EDIT ARTICLE FORM (Client Component)
 * 
 * Analogy for Beginners:
 * Think of this form like a control desk inside the vault.
 * - It loads the original document's folders (pre-filled fields from the "post" prop).
 * - The state hooks act as a drafting table, letting us alter sentences or rename the file.
 * - "Save" triggers the archivist (updatePostAction) to overwrite the old vault files.
 * - "Delete" triggers the shredder (deletePostAction) to destroy the record permanently.
 */
export default function EditPostForm({ post }: EditPostFormProps) {
    const router = useRouter();

    // 1. Initialize state variables pre-filled with the existing article data!
    const [title, setTitle] = useState(post.title); // Active title input
    const [body, setBody] = useState(post.body); // Raw Markdown body text
    const [status, setStatus] = useState(post.status); // Publish status select
    
    const [isLoading, setIsLoading] = useState(false); // Controls submission spinners
    const [isDeleting, setIsDeleting] = useState(false); // Controls deletion progress indicators
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Toggles safety modal
    
    const [errorMsg, setErrorMsg] = useState<string | null>(null); // Captures validation feedback
    const [successMsg, setSuccessMsg] = useState<string | null>(null); // Captures update success notice

    // 2. Update/Save handler (PUT request)
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault(); // Block default page reloads

        // Clear previous state notifications
        setErrorMsg(null);
        setSuccessMsg(null);

        // Validation boundary
        if (!title.trim()) {
            setErrorMsg("Article title cannot be left completely blank.");
            return;
        }
        if (!body.trim()) {
            setErrorMsg("Article content body cannot be left completely blank.");
            return;
        }

        setIsLoading(true);

        try {
            // Trigger our secure update Server Action, passing the original slug and new values
            const result = await updatePostAction(post.slug, {
                title: title.trim(),
                body: body.trim(),
                status: status,
            });

            if (result.success && result.post) {
                setSuccessMsg("Changes saved successfully! Redirecting...");
                
                // Pause briefly to let the writer see the success banner
                setTimeout(() => {
                    // Redirect directly to the updated article URL.
                    // Note: If the title changed, the slug changed too, so we redirect to the *new* slug!
                    router.push(`/${result.post.slug}`);
                    router.refresh(); // Forces Next.js to flush server-side layouts cache
                }, 1000);
            } else {
                setErrorMsg(result.message || "Failed to update the article. Please check your inputs.");
                setIsLoading(false);
            }
        } catch (error: any) {
            setErrorMsg(error.message || "An unexpected connection error occurred.");
            setIsLoading(false);
        }
    };

    // 3. Deletion handler (DELETE request)
    const handleDelete = async () => {
        setErrorMsg(null);
        setIsDeleting(true);

        try {
            // Trigger our secure delete Server Action, passing the target slug
            const result = await deletePostAction(post.slug);

            if (result.success) {
                // Reroute the user back to the main dashboard homepage upon successful deletion
                router.push("/dashboard");
                router.refresh();
            } else {
                setErrorMsg(result.message || "Failed to delete this article.");
                setIsDeleting(false);
                setShowDeleteConfirm(false); // Hide the safety popup block
            }
        } catch (error: any) {
            setErrorMsg(error.message || "Could not complete account request.");
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="space-y-8">
            
            {/* Status alerts */}
            {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold animate-in slide-in-from-top-1 duration-200">
                    {errorMsg}
                </div>
            )}
            {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold animate-in slide-in-from-top-1 duration-200">
                    {successMsg}
                </div>
            )}

            {/* EDITING FORM CANVAS */}
            <form onSubmit={handleUpdate} className="space-y-6">
                
                {/* Title & Status Settings */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 p-4 rounded-2xl">
                    <div className="flex-1 w-full">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Edit title..."
                            className="w-full text-xl sm:text-2xl font-black bg-transparent border-none focus:outline-none focus:ring-0 text-zinc-950 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-700"
                            disabled={isLoading || isDeleting}
                            required
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest shrink-0">
                            Status:
                        </span>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="text-xs font-bold border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-350 focus:outline-none cursor-pointer shadow-sm"
                            disabled={isLoading || isDeleting}
                        >
                            <option value="draft">Draft (Private)</option>
                            <option value="published">Published (Public)</option>
                        </select>
                    </div>
                </div>

                {/* Markdown Editor Canvas */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 shadow-sm">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                        Edit Markdown Content
                    </span>
                    
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write your article body content here using Markdown formatting..."
                        className="w-full min-h-[400px] bg-transparent resize-y border-none focus:outline-none focus:ring-0 text-zinc-800 dark:text-zinc-200 font-mono text-sm leading-relaxed placeholder-zinc-300 dark:placeholder-zinc-700"
                        disabled={isLoading || isDeleting}
                        required
                    />
                </div>

                {/* Bottom Buttons Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    
                    {/* Left: Delete Trigger Button */}
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="h-11 px-4 rounded-xl border border-red-100 dark:border-red-950/30 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        disabled={isLoading || isDeleting}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Article</span>
                    </button>

                    {/* Right: Cancel & Save Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="h-11 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-750 dark:text-zinc-300 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                            disabled={isLoading || isDeleting}
                        >
                            Cancel
                        </button>
                        
                        <button
                            type="submit"
                            className="h-11 px-6 rounded-xl bg-[#FF5A36] hover:bg-[#E04F2F] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-50"
                            disabled={isLoading || isDeleting}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Saving Changes...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>

                </div>

            </form>

            {/* ============================================================================== */}
            {/* SAFETY DELETION CONFIRMATION DIALOG MODAL */}
            {/* ============================================================================== */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        onClick={() => !isDeleting && setShowDeleteConfirm(false)}
                        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                    />
                    
                    {/* Modal Box */}
                    <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-6 rounded-2xl shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 text-left">
                        <div className="flex items-center gap-3 text-red-650">
                            <AlertTriangle size={24} />
                            <h3 className="text-base font-extrabold">Permanent Deletion Warning</h3>
                        </div>
                        
                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Are you absolutely sure you want to permanently erase <strong className="text-zinc-950 dark:text-white">"{post.title}"</strong> from the database? This action is irreversible. All comments and likes linked to this article will be destroyed automatically.
                        </p>
                        
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="h-10 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-750 dark:text-zinc-300 font-bold text-xs cursor-pointer"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Purging Shelves...</span>
                                    </>
                                ) : (
                                    <span>Yes, Shred It</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
