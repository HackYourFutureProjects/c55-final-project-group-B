import os


def test_fct_postings_sql_exists():
    """Verify that the primary mart SQL model exists in the expected dbt directory."""
    possible_paths = [
        "dbt/models/marts/fct_postings.sql",
        "models/marts/fct_postings.sql",
        "dbt/models/fct_postings.sql",
    ]
    assert any(
        os.path.exists(path) for path in possible_paths
    ), "fct_postings.sql model file is missing from the repository."


def test_fct_postings_contains_required_columns():
    """Ensure fct_postings.sql includes essential contract columns for the backend."""
    model_path = None
    for path in ["dbt/models/marts/fct_postings.sql", "models/marts/fct_postings.sql"]:
        if os.path.exists(path):
            model_path = path
            break

    if model_path:
        with open(model_path, "r") as f:
            content = f.read()

        # Check for core required keys
        assert "job_id" in content, "Model missing job_id column"
        assert "stg_postings" in content, "Model missing reference to stg_postings"
