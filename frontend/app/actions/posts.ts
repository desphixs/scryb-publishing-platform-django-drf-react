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

/**
 * CREATE ARTICLE ACTION
 * 
 * Analogy for Beginners:
 * Think of this action like submitting a brand-new article draft to a publishing office.
 * Before handing it to the database kitchen, the action automatically creates a URL-friendly nameplate
 * (the dynamic "slug") by lowercasing the title, replacing spaces with hyphens, and stripping special symbols.
 * 
 * Since this creates a new post, we send a secure POST request to the Django endpoint `/posts/`.
 */
export async function createPostAction(payload: { title: string; body: string; status?: string }) {
    try {
        // 1. Automatically generate a URL-friendly slug from the post title.
        // We convert the title to lowercase, replace any non-alphanumeric character with a hyphen,
        // and trim off any trailing or leading hyphens.
        const slug = payload.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric chars with -
            .replace(/(^-|-$)+/g, ""); // trim leading/trailing -

        // 2. Dispatch a secure POST request to our Django REST API endpoint `/posts/`.
        // The apiFetch wrapper automatically resolves our cookies and attaches the Bearer JWT.
        const response = await apiFetch("/posts/", {
            method: "POST",
            body: {
                title: payload.title,
                slug: slug, // Submit the generated slug
                body: payload.body,
                status: payload.status || "draft", // Default to draft if status is unspecified
            },
        });

        // 3. Evaluate if the database transaction was successful.
        if (response.ok) {
            return {
                success: true,
                post: response.data, // Contains the newly created article JSON object
            };
        } else {
            // Django's PostSerializer returns validation error arrays (e.g. if the title is duplicate)
            return {
                success: false,
                post: null,
                message: response.data?.detail || response.data?.slug?.[0] || response.data?.title?.[0] || "Failed to save the new article. Please check your inputs.",
            };
        }
    } catch (error: any) {
        // 4. Intercept unexpected network failures safely.
        return {
            success: false,
            post: null,
            message: `Network error: ${error.message || "Failed to connect to the backend server."}`,
        };
    }
}

/**
 * UPDATE ARTICLE ACTION
 * 
 * Analogy for Beginners:
 * Think of this like asking a vault archivist to replace pages inside an existing manuscript folder.
 * We specify the unique book slug, hand the new contents (title, body, status),
 * and the archivist replaces the database rows.
 * 
 * Since this modifies an existing post, we send a secure PUT request to `/posts/<slug>/`.
 */
export async function updatePostAction(slug: string, payload: { title: string; body: string; status?: string }) {
    try {
        // 1. Generate a new slug based on the updated title to ensure URLs match the edited title!
        const newSlug = payload.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");

        // 2. Dispatch a secure PUT request to the Django endpoint `/posts/<slug>/`.
        const response = await apiFetch(`/posts/${slug}/`, {
            method: "PUT",
            body: {
                title: payload.title,
                slug: newSlug, // Submit the newly generated slug based on the updated title
                body: payload.body,
                status: payload.status || "draft",
            },
        });

        // 3. Evaluate if the updates were saved successfully in Django SQLite.
        if (response.ok) {
            return {
                success: true,
                post: response.data, // Contains the updated article JSON object
            };
        } else {
            // Retrieve validation error messages if any fields failed model validation
            return {
                success: false,
                post: null,
                message: response.data?.detail || response.data?.slug?.[0] || response.data?.title?.[0] || "Failed to update article. Please check your inputs.",
            };
        }
    } catch (error: any) {
        // 4. Handle unexpected connection faults.
        return {
            success: false,
            post: null,
            message: `Network error: ${error.message || "Failed to connect to the backend server."}`,
        };
    }
}

/**
 * DELETE ARTICLE ACTION
 * 
 * Analogy for Beginners:
 * Think of this like ordering the vault clerk to throw a specific book into the paper shredder.
 * We identify the target folder using the slug, check if we have owner keys,
 * and if verified, the clerk erases it permanently from the archive shelves.
 * 
 * Since this destroys a post record, we send a secure DELETE request to `/posts/<slug>/`.
 */
export async function deletePostAction(slug: string) {
    try {
        // 1. Dispatch a secure DELETE request to the Django endpoint `/posts/<slug>/`.
        const response = await apiFetch(`/posts/${slug}/`, {
            method: "DELETE",
        });

        // 2. Evaluate if the database erasure succeeded (standard status code 204 No Content).
        if (response.ok) {
            return {
                success: true,
                message: "Article has been permanently deleted from the database.",
            };
        } else {
            // Capture any authorization rejection errors (e.g. if a different user tries to delete)
            return {
                success: false,
                message: response.data?.detail || "You do not have permission to delete this article.",
            };
        }
    } catch (error: any) {
        // 3. Handle unexpected network Drops.
        return {
            success: false,
            message: `Network error: ${error.message || "Failed to connect to the backend server."}`,
        };
    }
}

