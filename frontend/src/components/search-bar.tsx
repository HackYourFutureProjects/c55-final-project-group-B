import { MagnifyingGlassIcon, MapPinIcon } from "@phosphor-icons/react/ssr";
import { getJobTitles, getLocations } from "@/lib/jobs";
import { buildLocationOptions } from "@/lib/job-filters";
import styles from "./search-bar.module.css";
import SearchInput from "./search-input";
import LocationInput from "./location-input";

export async function SearchBar({
  action = "/jobs",
  defaultQuery,
  defaultLocation,
}: {
  action?: string;
  defaultQuery?: string;
  defaultLocation?: string;
}) {
  const [titles, { cities, provinces }] = await Promise.all([
    getJobTitles(),
    getLocations(),
  ]);
  const locationOptions = buildLocationOptions(cities, provinces);

  return (
    <form action={action} method="get" className={styles.form}>
      <MagnifyingGlassIcon
        size={18}
        weight="duotone"
        className={styles.icon}
        aria-hidden="true"
      />
      <SearchInput defaultValue={defaultQuery} titles={titles} />
      <div className={styles.wrapper}>
        <MapPinIcon
          size={18}
          weight="duotone"
          className={styles.icon}
          aria-hidden="true"
        />
        <LocationInput
          defaultValue={defaultLocation}
          options={locationOptions}
        />
      </div>
      <button type="submit" className="button">
        Search
      </button>
    </form>
  );
}
