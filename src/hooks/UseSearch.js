import { useState, useEffect, useRef } from "react";

/**
 * Hook to manage search with debouncing and auto cancelation.
 * @param {function} searchFn - Function made the search (expected return Promisse).
 * @param {number} debounceMs - Time of awaiting after last input to trigger search (default: 300ms).
 */

export function useSearch(searchFn, debounceMs = 300) {
 const [query, setQuery] = useState("");
 const [results, setResults] = useState([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);

 const abortControllerRef = useRef(null);
 const debounceRef = useRef(null);

 useEffect(() => {
  if (!query) {
   setResults([]);
   setLoading(false);
   setError(null);
   return;
  }

 if (debounceRef.current) {
  clearTimeout(debounceRef.current);
 }

 debounceRef.current = setTimeout(async () => {
  if (abortControllerRef.current) {
   abortControllerRef.current.abort();
  }

  const controller = new AbortController();
  abortControllerRef.current = controller;

  setLoading(true);
  setError(null);

  try {
   const data = await searchFn(query, { signal: controller.signal });
   setResults(data || []);
  }
  catch (err) {
   if (err.name !== "AbortError") {
    setError(err);
   }
  }
  finally {
   setLoading(false);
  }
 }, debounceMs);

 return () => {
  if (debounceRef.current) clearTimeout(debounceRef.current);
  if (abortControllerRef.current) abortControllerRef.current.abort();
 };
 }, [query, searchFn, debounceMs]);

 const refetch = () => {
  setQuery((q) => q + "");
 };

 return { query, setQuery, results, loading, error, refetch};
}