import { MagnifyingGlassIcon, MapPinIcon } from "@phosphor-icons/react/ssr";
import { buildLocationOptions } from "@/lib/job-filters";
import { getJobTitles, getLocations } from "@/lib/jobs";
import LocationInput from "./location-input";
import styles from "./search-bar.module.css";
import SearchInput from "./search-input";

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
    <search aria-label="Job search">
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
    </search>
  );
}
