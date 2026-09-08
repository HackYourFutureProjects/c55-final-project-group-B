import Image from "next/image";
import { StaticImageData } from "next/image";
import Link from "next/link";
import {
  GithubLogoIcon,
  LinkedinLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
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
        height={256}
        width={256}
        alt={`${name} profile photo`}
        className={styles.photo}
      ></Image>
      <div className={styles.details}>
        <h2 className={styles.name}>{name}</h2>
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
