import { useState, useEffect, useRef } from "react";
import { TOP_MEDICATIONS } from "@/assets/data/commonDrugs"; // Layer 1 (Static)
import { searchDrugUnified } from "@/utils/drugDataService"; // Layer 3 (Deep Search)

// Layer 2: Lightweight API Prefix Search (Optimized OpenFDA Count)
const OPENFDA_PREFIX_URL = "https://api.fda.gov/drug/label.json?count=openfda.brand_name.exact&limit=10";

export interface PredictionResult {
    name: string;
    source: "local" | "api";
}

export function useDrugAutocomplete(query: string, delay = 300) {
    const [suggestions, setSuggestions] = useState<PredictionResult[]>([]);
    const [loading, setLoading] = useState(false);
    const cache = useRef<Record<string, string[]>>({});

    useEffect(() => {
        // 1. Instant Local Filter (0ms Latency)
        if (!query || query.length < 2) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        const lowerQuery = query.toLowerCase();

        // Algorithm: "Smart Ranker"
        // 1. Exact "Starts With" matches (Highest Priority)
        // 2. "Contains" matches (Lower Priority)
        const localMatches = TOP_MEDICATIONS.filter(med =>
            med.toLowerCase().includes(lowerQuery)
        ).sort((a, b) => {
            const aStarts = a.toLowerCase().startsWith(lowerQuery);
            const bStarts = b.toLowerCase().startsWith(lowerQuery);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return a.localeCompare(b);
        }).slice(0, 5); // Take top 5 local

        // Set immediate local feedback
        setSuggestions(localMatches.map(name => ({ name, source: "local" })));
        setLoading(true);

        // 2. Debounced API Call (Layer 2) for "Deep Search"
        const timer = setTimeout(async () => {
            // Check Cache
            if (cache.current[lowerQuery]) {
                mergeResults(localMatches, cache.current[lowerQuery]);
                setLoading(false);
                return;
            }

            try {
                // Fetch from OpenFDA Count endpoint (Fastest for prefix)
                // Query: count=openfda.brand_name.exact&search=openfda.brand_name:"Gab*"
                const apiQuery = `openfda.brand_name:"${query}*"`;
                const response = await fetch(`${OPENFDA_PREFIX_URL}&search=${apiQuery}`);

                let apiNames: string[] = [];
                if (response.ok) {
                    const data = await response.json();
                    // OpenFDA count returns terms like "GABAPENTIN". We capitalize nicely.
                    apiNames = data.results?.map((r: any) => formatDrugName(r.term)) || [];
                }

                // Cache It
                cache.current[lowerQuery] = apiNames;

                mergeResults(localMatches, apiNames);

            } catch (e) {
                console.log("Autocomplete API Error", e);
            } finally {
                setLoading(false);
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [query]);

    const mergeResults = (local: string[], api: string[]) => {
        const combined = new Set(local); // Start with local
        api.forEach(name => combined.add(name)); // Add API (Set handles dupes)

        const sorted = Array.from(combined).sort((a, b) => {
            // Re-sort combined list logic
            const aStarts = a.toLowerCase().startsWith(query.toLowerCase());
            const bStarts = b.toLowerCase().startsWith(query.toLowerCase());
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return a.length - b.length; // Shortest first (usually more relevant)
        });

        setSuggestions(sorted.slice(0, 10).map(name => ({
            name,
            source: local.includes(name) ? "local" : "api"
        })));
    };

    return { suggestions, loading };
}

function formatDrugName(name: string) {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
