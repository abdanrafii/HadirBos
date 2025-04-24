import { createContext } from "react";

type SearchContextType = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
};

export const SearchContext = createContext<SearchContextType>({
  searchTerm: "",
  setSearchTerm: () => {}, 
});