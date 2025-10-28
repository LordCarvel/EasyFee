import { useSearch } from "../../hooks/UseSearch";
import { mockSearch } from "../../hooks/MockSearch";

export default function SearchTest() {
 const { query, setQuery, results, loading} = useSearch(mockSearch);

 return (
  <div>
   <input
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Search address..."
    />
    {loading && <p>Loading...</p>} 
    <ul>
     {results.map((r) => (
      <li key={r.id}>{r.name}</li>
     ))}
    </ul>
  </div>
 )
}