import { MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";
import { getLocations } from "@/lib/jobs";
import styles from "./search-bar.module.css";

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
