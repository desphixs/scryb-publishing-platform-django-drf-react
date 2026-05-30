// Instruct Next.js that this entire file runs exclusively on the secure server.
// The 'use server' directive guarantees this code never downloads to the client browser!
"use server";

// Import our standardized, secure fetch utility.
// This utility automatically handles prepending the base backend URL,
// parsing JSON responses safely, and attaching the JWT access token if available.
import { apiFetch } from "@/lib/api";

/**
 * GET PUBLISHED POSTS ACTION
 * 
 * Analogy for Beginners:
 * Think of this action like a messenger who walks up to the library's front desk
 * and asks for the list of all books that are ready for the public to read.
 * Since anyone can read these books, the messenger doesn't need to show a secret access badge.
 * 
 * We call our Django REST API endpoint `/posts/` (which is mapped to the PostListCreateView in Django).
 */
export async function getPublishedPostsAction() {
    try {
        // 1. Send a request to our Django API backend to fetch the published posts.
        // We use the "GET" method because we only want to retrieve data, not modify anything.
        // We set 'cache: "no-store"' to ensure we always fetch the freshest articles instead of outdated caches.
        const response = await apiFetch("/posts/", {
            method: "GET",
            cache: "no-store",
        });

        // 2. Check if our API request succeeded (the "ok" flag will be true if the status is 200-299).
        if (response.ok) {
            // Return a clean success object containing the list of posts returned by Django.
            return {
                success: true,
                posts: response.data, // This is the JSON array of posts mapped by PostSerializer
            };
        } else {
            // If the backend returns an error status (like 500 or 400), we capture the custom error message.
            return {
                success: false,
                posts: [],
                message: response.data?.detail || "Failed to load articles from the database.",
            };
        }
    } catch (error: any) {
        // 3. Catch any unexpected network issues (like if the Django server is offline).
        return {
            success: false,
            posts: [],
            message: `Network error: ${error.message || "Failed to connect to the backend server."}`,
        };
    }
}

/**
 * GET POST BY SLUG ACTION
 * 
 * Analogy for Beginners:
 * Think of this action like asking the librarian to retrieve a specific book from the shelf
 * by telling them the book's unique identifier code (in this case, its URL "slug").
 * 
 * We call the Django REST API endpoint `/posts/<slug>/` (mapped to PostDetailView in Django).
 */
export async function getPostBySlugAction(slug: string) {
    try {
        // 1. Send a request to our Django API backend fetching the details of a single post.
        // We interpolate the dynamic "slug" string directly into the API endpoint path.
        const response = await apiFetch(`/posts/${slug}/`, {
            method: "GET",
            cache: "no-store",
        });

        // 2. Check if the API successfully retrieved our post.
        if (response.ok) {
            // Return a clean success object containing the single article details.
            return {
                success: true,
                post: response.data, // This is the JSON object mapped by PostSerializer
            };
        } else {
            // If the post is not found (404) or is a draft that we don't have access to, handle it gracefully.
            return {
                success: false,
                post: null,
                message: response.data?.detail || "Failed to locate the requested article details.",
            };
        }
    } catch (error: any) {
        // 3. Catch unexpected connection faults securely.
        return {
            success: false,
            post: null,
            message: `Network error: ${error.message || "Failed to connect to the backend server."}`,
        };
    }
}
