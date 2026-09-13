# OPTIONAL. A health page for your team, not part of the required pipeline
# and not the product UI. See data/optional/README.md.
"""Operations dashboard for the pipeline.

This is for your team, not for end users. The product UI is the frontend
trainee's job. This page answers one question: is the pipeline healthy?

streamlit and pandas are not installed by default. Install the extra first:

    uv sync --extra dashboard
    uv run streamlit run optional/streamlit/sec_app.py

It reads the same `.env` as everything else: point BACKEND_PG_* at the
database you want to look at.
"""

import os
import pandas as pd
import psycopg
import streamlit as st
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(page_title="Pipeline Health & Source Breakdown", page_icon="📊", layout="wide")
st.title("📊 Multi-Source Pipeline Health & Source Analytics")

DSN = (
    f"host={os.environ['BACKEND_PG_HOST']} "
    f"port={os.getenv('BACKEND_PG_PORT', '5432')} "
    f"dbname={os.environ['BACKEND_PG_DB']} user={os.environ['BACKEND_PG_USER']} "
    f"password={os.environ['BACKEND_PG_PASSWORD']}"
)
SCHEMA = os.getenv("BACKEND_PG_PUBLISH_SCHEMA", "analytics")


def run_query(query: str) -> pd.DataFrame:
    """Helper to run psycopg SQL queries safely and return a DataFrame."""
    with psycopg.connect(DSN) as conn, conn.cursor() as cursor:
        cursor.execute(query)
        columns = [column.name for column in cursor.description]
        return pd.DataFrame(cursor.fetchall(), columns=columns)


@st.cache_data(ttl=60)
def load_source_summary() -> pd.DataFrame:
    query = f"""
        select
            source_system,
            count(*) as total_jobs,
            count(distinct location_city) as cities_covered,
            count(distinct company_name) as distinct_companies,
            max(ingested_at) as last_ingest
        from {SCHEMA}.fct_postings
        group by source_system
    """
    return run_query(query)


# --- 1. OVERALL PIPELINE & SOURCE SUMMARY METRICS ---
st.subheader("⚡ Source System Overview (Adzuna vs. JobSpy)")
df_sources = load_source_summary()

if not df_sources.empty:
    cols = st.columns(len(df_sources) + 1)

    # Total combined metric
    total_all = df_sources["total_jobs"].sum()
    cols[0].metric("Total Combined Postings", f"{total_all:,}")

    # Metrics per source
    for i, row in df_sources.iterrows():
        cols[i + 1].metric(
            label=f"Source: {row['source_system'].upper()}",
            value=f"{row['total_jobs']:,} jobs",
            delta=f"{row['cities_covered']} cities | {row['distinct_companies']} companies",
            delta_color="off",
        )

st.divider()

# --- 2. DUAL INGESTION TREND (AREA CHART) ---
st.subheader("📈 Daily Ingestion Trend by Source")
st.caption("Verifies daily Airflow pipeline execution across both ingestion adapters.")

query_ingestion = f"""
    select 
        date(ingested_at) as ingest_date,
        source_system,
        count(*) as posting_count
    from {SCHEMA}.fct_postings
    group by 1, 2
    order by 1 desc
"""
df_ingest = run_query(query_ingestion)
if not df_ingest.empty:
    pivoted_ingest = df_ingest.pivot(
        index="ingest_date", columns="source_system", values="posting_count"
    ).fillna(0)
    st.area_chart(pivoted_ingest)

st.divider()

# --- 3. COMPARATIVE SOURCE CHARTS (SIDE-BY-SIDE) ---
st.subheader("🔍 Adzuna vs. JobSpy Content Deep-Dive")

tab_cities, tab_contracts, tab_titles = st.tabs(
    ["🏙️ Top Cities by Source", "📜 Contract & Employment Types", "💼 Top Job Titles"]
)

with tab_cities:
    col_adz, col_jsp = st.columns(2)

    with col_adz:
        st.markdown("### 🟢 Adzuna - Top Cities")
        q_adz_cities = f"""
            select coalesce(location_city, 'Unknown') as city, count(*) as job_count
            from {SCHEMA}.fct_postings
            where lower(source_system) like '%adzuna%'
            group by 1 order by job_count desc limit 8
        """
        df_adz_city = run_query(q_adz_cities)
        if not df_adz_city.empty:
            st.bar_chart(df_adz_city.set_index("city"), horizontal=True)

    with col_jsp:
        st.markdown("### 🔵 JobSpy - Top Cities")
        q_jsp_cities = f"""
            select coalesce(location_city, 'Unknown') as city, count(*) as job_count
            from {SCHEMA}.fct_postings
            where lower(source_system) like '%jobspy%'
            group by 1 order by job_count desc limit 8
        """
        df_jsp_city = run_query(q_jsp_cities)
        if not df_jsp_city.empty:
            st.bar_chart(df_jsp_city.set_index("city"), horizontal=True)

with tab_contracts:
    st.markdown("### Contract Type Distribution Across Sources")
    q_contract = f"""
        select 
            source_system,
            coalesce(contract_type, 'unspecified') as contract_type,
            count(*) as postings
        from {SCHEMA}.fct_postings
        group by 1, 2
    """
    df_contract = run_query(q_contract)
    if not df_contract.empty:
        pivoted_contract = df_contract.pivot(
            index="source_system", columns="contract_type", values="postings"
        ).fillna(0)
        st.bar_chart(pivoted_contract, stack=True)

with tab_titles:
    col_t_adz, col_t_jsp = st.columns(2)

    with col_t_adz:
        st.markdown("### 🟢 Adzuna - Most Posted Roles")
        q_adz_t = f"""
            select coalesce(title, 'Unknown') as title, count(*) as postings
            from {SCHEMA}.fct_postings
            where lower(source_system) like '%adzuna%'
            group by 1 order by postings desc limit 10
        """
        df_adz_t = run_query(q_adz_t)
        if not df_adz_t.empty:
            st.dataframe(df_adz_t, use_container_width=True, hide_index=True)

    with col_t_jsp:
        st.markdown("### 🔵 JobSpy - Most Posted Roles")
        q_jsp_t = f"""
            select coalesce(title, 'Unknown') as title, count(*) as postings
            from {SCHEMA}.fct_postings
            where lower(source_system) like '%jobspy%'
            group by 1 order by postings desc limit 10
        """
        df_jsp_t = run_query(q_jsp_t)
        if not df_jsp_t.empty:
            st.dataframe(df_jsp_t, use_container_width=True, hide_index=True)

st.divider()

# --- 4. EXTRACTED SKILLS PER SOURCE SYSTEM ---
st.subheader("🛠️ Top Skills Extracted (Broken Down by Source)")

# Query reads directly from the dedicated fct_postings_skills table
q_skills_source = f"""
    select 
        p.source_system,
        s.skill_name as skill,
        count(*) as frequency
    from {SCHEMA}.fct_postings_skills s
    join {SCHEMA}.fct_postings p on s.job_id = p.job_id
    where s.skill_name is not null
    group by 1, 2
    order by frequency desc
"""

try:
    df_skills_src = run_query(q_skills_source)

    if not df_skills_src.empty:
        # Get overall top 12 most frequent skills
        top_skills = df_skills_src.groupby("skill")["frequency"].sum().nlargest(12).index

        # Filter and pivot by source_system for stacked comparison
        filtered_skills = df_skills_src[df_skills_src["skill"].isin(top_skills)]
        pivoted_skills = filtered_skills.pivot(
            index="skill", columns="source_system", values="frequency"
        ).fillna(0)

        st.bar_chart(pivoted_skills)
    else:
        st.info("No records found in fct_postings_skills table yet.")

except Exception as e:
    st.warning(f"Could not load skills breakdown: {e}")
