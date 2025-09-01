"use client";

import { ChipToFormDemo } from "../../components/form/ChipToFormDemo";
import Link from "next/link";

export default function Day5Page() {
  return (
    <main className="min-h-screen bg-dark">
      <div className="container mx-auto px-6 py-16">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg"
          >
            ← Back to Index
          </Link>
        </div>

        <ChipToFormDemo />
      </div>
    </main>
  );
}
