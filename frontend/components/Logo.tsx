import React from "react";
// Import the Shield icon from Lucide React to act as our modern security symbol logo.
import { Shield } from "lucide-react";
import Link from "next/link";

/**
 * BRAND LOGO COMPONENT
 *
 * Analogy:
 * Think of this like the main metal seal placed at the entrance of our hotel lobby.
 * It houses the Shield symbol inside a dark aesthetic square, and links guests back
 * to the landing homepage whenever clicked.
 */
export default function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2 group">
            {/* Render the beautiful quill logo image */}
            <img 
                src="https://cdn-icons-png.flaticon.com/128/3402/3402339.png" 
                alt="Scryb Logo" 
                className="w-7 h-7 object-contain group-hover:scale-105 transition-transform duration-200" 
            />
            {/* Brand title text with tight tracking and bold design */}
            <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                Scryb
            </span>
        </Link>
    );
}
