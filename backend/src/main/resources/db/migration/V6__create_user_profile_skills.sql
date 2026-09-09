CREATE TABLE user_profile_skills (
                                     user_id    UUID NOT NULL,
                                     skill_name VARCHAR(100) NOT NULL,
                                     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

                                     CONSTRAINT user_profile_skills_pk
                                         PRIMARY KEY (user_id, skill_name),

                                     CONSTRAINT user_profile_skills_user_fk
                                         FOREIGN KEY (user_id)
                                             REFERENCES users(id)
                                             ON DELETE CASCADE,

                                     CONSTRAINT user_profile_skills_name_not_blank
                                         CHECK (BTRIM(skill_name) <> '')
);