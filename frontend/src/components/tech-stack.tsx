import type { ReactNode } from "react";
import styles from "./tech-stack.module.css";
import {
  AtomIcon,
  CoffeeIcon,
  DatabaseIcon,
  FeatherIcon,
  FilePyIcon,
  FileSqlIcon,
  FileTsxIcon,
  LeafIcon,
  PaintBrushBroadIcon,
  PinwheelIcon,
  StackIcon,
  TriangleIcon,
} from "@phosphor-icons/react/ssr";

type Technology = {
  name: string;
  description: string;
  icon: ReactNode;
};

type Track = {
  track: string;
  color: string;
  technology: Technology[];
};

const TRACKS: Track[] = [
  {
    track: "Frontend",
    color: styles.swatchFoam,
    technology: [
      {
        name: "TypeScript",
        description: "Catches errors before they ship",
        icon: <FileTsxIcon size={24} weight="duotone" />,
      },
      {
        name: "React",
        description: "Builds the interface with components",
        icon: <AtomIcon size={24} weight="duotone" />,
      },
      {
        name: "Next.js",
        description: "Handles routing and rendering",
        icon: <TriangleIcon size={24} weight="duotone" />,
      },
      {
        name: "CSS",
        description: "Styles the site using modules",
        icon: <PaintBrushBroadIcon size={24} weight="duotone" />,
      },
    ],
  },
  {
    track: "Backend",
    color: styles.swatchRose,
    technology: [
      {
        name: "PostgreSQL",
        description: "Stores the jobs, users, and saved lists",
        icon: <FileSqlIcon size={24} weight="duotone" />,
      },
      {
        name: "Java",
        description: "The language the API is written in",
        icon: <CoffeeIcon size={24} weight="duotone" />,
      },
      {
        name: "Spring Boot",
        description: "Runs and handles the API",
        icon: <LeafIcon size={24} weight="duotone" />,
      },
      {
        name: "Maven",
        description: "Builds the project and its dependencies",
        icon: <FeatherIcon size={24} weight="duotone" />,
      },
    ],
  },
  {
    track: "Data",
    color: styles.swatchIris,
    technology: [
      {
        name: "Python",
        description: "Powers the data pipeline",
        icon: <FilePyIcon size={24} weight="duotone" />,
      },
      {
        name: "Airflow",
        description: "Schedules the pipeline runs",
        icon: <PinwheelIcon size={24} weight="duotone" />,
      },
      {
        name: "dbt",
        description: "Transforms the raw data",
        icon: <DatabaseIcon size={24} weight="duotone" />,
      },
      {
        name: "Databricks",
        description: "Where the transformations run",
        icon: <StackIcon size={24} weight="duotone" />,
      },
    ],
  },
];

function TrackCard({ track, color, technology }: Track) {
  return (
    <article className={`card ${styles.track}`}>
      <h3 className={styles.trackName}>{track}</h3>
      <ul className={styles.list}>
        {technology.map((tech) => (
          <li key={tech.name} className={styles.item}>
            <span aria-hidden className={`${styles.icon} ${color}`}>
              {tech.icon}
            </span>
            <div>
              <p className={styles.name}>{tech.name}</p>
              <p className={styles.description}>{tech.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function TechStack() {
  return (
    <section>
      <h2 className={styles.heading}>Tech Stack</h2>
      <div className={styles.grid}>
        {TRACKS.map((track) => (
          <TrackCard key={track.track} {...track} />
        ))}
      </div>
    </section>
  );
}
