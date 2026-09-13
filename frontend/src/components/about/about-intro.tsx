import styles from "./about-intro.module.css";

export default function AboutIntro() {
  return (
    <section className={styles.intro}>
      <div className={`container ${styles.inner}`}>
        <h1 className={styles.heading}>About Flint</h1>
        <p>
          Flint is a job search platform based in the Netherlands, built by five
          trainees and one project manager as our final project. As we're all
          navigating the job market in this shifting landscape, we wanted to
          create a platform that would help us.
        </p>
        <p>
          The name Flint comes from the hard stone that was historically struck
          to create fires. In a similar vein, our platform creates a spark for
          your new role.
        </p>
        <div className={styles.videoWrapper}>
          <iframe
            className={styles.video}
            src="https://www.youtube.com/embed/-HiV20SavkE?si=6M2nbagNi_CKgfZW?modestbranding=1&rel=0&color=white"
            title="YouTube video player"
            width="1920"
            height="1080"
            allow="encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
