CREATE TABLE saved_jobs (
    user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id   TEXT NOT NULL,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, job_id)
);