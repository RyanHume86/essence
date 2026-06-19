import React, { createContext, useContext, useState } from "react";

// Lightweight shared search state so the header's search box and the views can
// read the same query without prop drilling.
const SearchContext = createContext({ query: "", setQuery: () => {} });

export function SearchProvider({ children }) {
  const [query, setQuery] = useState("");
  return <SearchContext.Provider value={{ query, setQuery }}>{children}</SearchContext.Provider>;
}

export const useSearch = () => useContext(SearchContext);
