"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KakaoButton from "@/components/KakaoButton";
import ContactSection from "@/components/ContactSection";

export default function ContactPage() {
    const [query, setQuery] = useState("");

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 overflow-hidden">
            <main className="max-w-5xl mx-auto px-4 space-y-6">
                <ContactSection />
            </main>
        </div>
    );
}
