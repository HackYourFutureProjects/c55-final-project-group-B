import { MapPinIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import styles from "./popular-searches.module.css";

const roles = ["Frontend", "Backend", "Data"];
const cities = ["Amsterdam", "Rotterdam", "Den Haag"];

export default function PopularSearches() {
  return (
    <nav aria-labelledby="popular-searches" className={styles.wrapper}>
      <p id="popular-searches" className={styles.label}>
        Popular searches:
      </p>
      <ul className={styles.list}>
        {roles.map((role) => (
          <li key={role}>
            <Link
              href={{ pathname: "/jobs", query: { q: role } }}
              className={styles.chip}
            >
              {role}
            </Link>
          </li>
        ))}
        {cities.map((city) => (
          <li key={city}>
            <Link
              href={{ pathname: "/location", query: { q: city } }}
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
