import { BACKEND_API_URL } from "@/lib/config";
import styles from "./search-bar.module.css";

type Locations = {
  cities: string[];
  provinces: string[];
};

async function getLocations(): Promise<Locations> {
  try {
    const [citiesRes, provincesRes] = await Promise.all([
      fetch(`${BACKEND_API_URL}/api/locations/cities`, { cache: "no-store" }),
      fetch(`${BACKEND_API_URL}/api/locations/provinces`, {
        cache: "no-store",
      }),
    ]);

    if (!citiesRes.ok || !provincesRes.ok) {
      throw new Error("Could not load locations");
    }

    return {
      cities: await citiesRes.json(),
      provinces: await provincesRes.json(),
    };
  } catch {
    // The search bar still works without the location filter options.
    return { cities: [], provinces: [] };
  }
}

export async function SearchBar({
  defaultQuery = "",
  defaultLocation = "",
}: {
  defaultQuery?: string;
  defaultLocation?: string;
}) {
  const { cities, provinces } = await getLocations();

  return (
    <form action="/jobs" method="get" className={styles.form}>
      <div className={styles.field}>
        <SearchIcon />
        <label htmlFor="q" className={styles.hiddenLabel}>
          Role, skill or company
        </label>
        <input
          id="q"
          name="q"
          type="search"
          placeholder="Role, skill or company"
          autoComplete="off"
          defaultValue={defaultQuery}
          className={styles.input}
        />
      </div>

      <label htmlFor="location" className={styles.hiddenLabel}>
        Location
      </label>
      <select
        id="location"
        name="location"
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

function SearchIcon() {
  return (
    <svg
      role="presentation"
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={styles.icon}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <circle cx="8.75" cy="8.75" r="5.25" />
      <path d="m12.75 12.75 3.75 3.75" />
    </svg>
  );
}
