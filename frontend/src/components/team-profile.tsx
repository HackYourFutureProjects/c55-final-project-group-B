import {
  GithubLogoIcon,
  LinkedinLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import styles from "./team-profile.module.css";

type TeamProfileProps = {
  photo: StaticImageData;
  name: string;
  role: string;
  github: string;
  linkedin: string;
};

export default function TeamProfile({
  photo,
  name,
  role,
  github,
  linkedin,
}: TeamProfileProps) {
  return (
    <div className={styles.card}>
      <Image
        src={photo}
        placeholder="blur"
        alt={`${name} profile photo`}
        className={styles.photo}
      ></Image>
      <div className={styles.details}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.role}>{role}</p>
        <div className={styles.links}>
          <Link className={`${styles.button} ${styles.github}`} href={github}>
            <GithubLogoIcon
              size={32}
              weight="duotone"
              aria-label={`${name} on GitHub`}
              target="_blank"
            />
          </Link>
          <Link
            className={`${styles.button} ${styles.linkedin}`}
            href={linkedin}
            aria-label={`${name} on LinkedIn`}
            target="_blank"
          >
            <LinkedinLogoIcon size={32} weight="duotone" />
          </Link>
        </div>
      </div>
    </div>
  );
}
