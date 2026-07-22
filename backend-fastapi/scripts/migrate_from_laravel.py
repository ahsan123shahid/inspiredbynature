"""
Migration Validation Script
Connects to the database and validates that the existing schema matches the SQLAlchemy model definitions.
Read-only — does NOT alter the database.

Usage:
    python scripts/migrate_from_laravel.py --db-url postgresql://user:pass@localhost/inspired_by_nature_v2
"""

import argparse
import sys
from sqlalchemy import create_engine, inspect, MetaData, text

sys.path.insert(0, "..")

from app.models.base import Base

MODEL_MAP = {
    table: model
    for table, model in Base.metadata.tables.items()
}

SKIP_TABLES = {"password_reset_tokens", "sessions", "personal_access_tokens", "cache", "jobs", "failed_jobs"}


def validate_schema(db_url: str):
    engine = create_engine(db_url)
    inspector = inspect(engine)
    db_meta = MetaData()
    db_meta.reflect(bind=engine)

    existing_tables = set(inspector.get_table_names())
    model_tables = set(MODEL_MAP.keys())

    print("=" * 60)
    print("DATABASE MIGRATION VALIDATION")
    print("=" * 60)

    all_ok = True

    missing_tables = model_tables - existing_tables - SKIP_TABLES
    if missing_tables:
        all_ok = False
        print(f"\n❌ MISSING TABLES: {', '.join(sorted(missing_tables))}")

    extra_tables = existing_tables - model_tables - SKIP_TABLES
    if extra_tables:
        print(f"\n⚠️  UNMAPPED TABLES (exist in DB but no SQLAlchemy model): {', '.join(sorted(extra_tables))}")

    for table_name in sorted(model_tables & existing_tables):
        model_table = MODEL_MAP[table_name]
        db_columns = {col["name"]: col for col in inspector.get_columns(table_name)}
        model_columns = {col.name: col for col in model_table.columns}

        model_col_names = set(model_columns.keys())
        db_col_names = set(db_columns.keys())

        missing_cols = model_col_names - db_col_names
        if missing_cols:
            all_ok = False
            print(f"\n❌ {table_name}: Missing columns: {', '.join(sorted(missing_cols))}")

        extra_cols = db_col_names - model_col_names
        if extra_cols:
            print(f"\n⚠️  {table_name}: Extra columns in DB (not in model): {', '.join(sorted(extra_cols))}")

        for col_name in sorted(model_col_names & db_col_names):
            mc = model_columns[col_name]
            dc = db_columns[col_name]
            model_type_str = str(mc.type)
            db_type_str = str(dc["type"])

            if model_type_str.split("(")[0].lower() != db_type_str.split("(")[0].lower():
                print(f"\n⚡ {table_name}.{col_name}: Type mismatch — Model: {model_type_str}, DB: {db_type_str}")

            if mc.nullable != dc.get("nullable", True):
                if mc.nullable:
                    print(f"\n⚡ {table_name}.{col_name}: Nullable mismatch — Model: nullable, DB: not nullable")

    engine.dispose()

    print("\n" + "=" * 60)
    if all_ok:
        print("✅ ALL CHECKS PASSED — Schema is valid")
    else:
        print("❌ VALIDATION FAILED — Fix the issues above before proceeding")
    print("=" * 60)

    return all_ok


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate database schema matches SQLAlchemy models")
    parser.add_argument("--db-url", required=True, help="Database URL to validate")
    args = parser.parse_args()
    success = validate_schema(args.db_url)
    sys.exit(0 if success else 1)
