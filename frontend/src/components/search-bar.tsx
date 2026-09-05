import { MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";
import { BACKEND_API_URL } from "@/lib/config";
import styles from "./search-bar.module.css";

type Locations = {
  cities: string[];
  provinces: string[];
};

async function getLocations(): Promise<Locations> {
  try {
    const [citiesRes, provincesRes] = await Promise.all([
      fetch(`${BACKEND_API_URL}/api/locations/cities`),
      fetch(`${BACKEND_API_URL}/api/locations/provinces`),
    ]);
    if (!citiesRes.ok || !provincesRes.ok) {
      throw new Error("Could not get locations.");
    }
    return {
      cities: await citiesRes.json(),
      provinces: await provincesRes.json(),
    };
  } catch {
    return { cities: [], provinces: [] };
  }
}

export async function SearchBar({
  action = "/jobs",
  defaultQuery,
  defaultLocation,
}: {
  action?: string;
  defaultQuery?: string;
  defaultLocation?: string;
}) {
  const { cities, provinces } = await getLocations();

  return (
    <form action={action} method="get" className={styles.form}>
      <MagnifyingGlassIcon size="18" weight="duotone" className={styles.icon} />
      <input
        type="search"
        name="q"
        id="q"
        aria-label="Search by role, skill or company"
        placeholder="Role, skill or company"
        defaultValue={defaultQuery}
        className={styles.input}
      />
      <select
        name="location"
        id="location"
        aria-label="Location filter"
        defaultValue={defaultLocation}
        className={styles.select}
      >
        <option value="">All locations</option>
        {cities.length > 0 && (
          <optgroup label="Cities">
            {cities.map((city) => (
              <option key={city} value={`city:${city}`}>
                {city}
              </option>
            ))}
          </optgroup>
        )}
        {provinces.length > 0 && (
          <optgroup label="Provinces">
            {provinces.map((province) => (
              <option key={province} value={`province:${province}`}>
                {province}
              </option>
            ))}
          </optgroup>
        )}
      </select>
      <button type="submit" className="button">
        Search
      </button>
    </form>
  );
}
