import { MapPinIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useId } from "react";
import styles from "./popular-searches.module.css";

const ROLES = ["Frontend", "Backend", "Data"];
const CITIES = ["Amsterdam", "Rotterdam", "Den Haag"];

export default function PopularSearches() {
  // Rendered on the home page and in the no-results state, so the label id
  // must be unique per instance rather than hardcoded.
  const labelId = useId();

  return (
    <nav aria-labelledby={labelId} className={styles.wrapper}>
      <p id={labelId} className={styles.label}>
        Popular searches:
      </p>
      <ul className={styles.list}>
        {ROLES.map((role) => (
          <li key={role}>
            <Link
              href={{ pathname: "/jobs", query: { q: role } }}
              className={styles.chip}
            >
              {role}
            </Link>
          </li>
        ))}
        {CITIES.map((city) => (
          <li key={city}>
            <Link
              href={{ pathname: "/jobs", query: { location: `city:${city}` } }}
              className={styles.chip}
            >
              <MapPinIcon size={15} weight="duotone" aria-hidden="true" />{" "}
              {city}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
