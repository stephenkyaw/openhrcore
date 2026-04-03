"""Add roles and role_permissions tables for dynamic RBAC.

Revision ID: 0003
Revises: 0002
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None

TENANT_ID = "00000000-0000-0000-0000-000000000001"

SYSTEM_ROLES = [
    {
        "id": "00000000-0000-0000-0000-a00000000001",
        "name": "admin",
        "description": "Full access to all features including user and tenant management",
        "is_system": True,
        "permissions": [
            "manage_users", "manage_tenant", "manage_jobs", "manage_candidates",
            "manage_applications", "manage_pipelines", "run_screening",
            "manage_notes", "view_all", "manage_roles",
        ],
    },
    {
        "id": "00000000-0000-0000-0000-a00000000002",
        "name": "recruiter",
        "description": "Manage the full recruitment lifecycle: jobs, candidates, applications, pipelines, and AI screening",
        "is_system": True,
        "permissions": [
            "manage_jobs", "manage_candidates", "manage_applications",
            "manage_pipelines", "run_screening", "manage_notes", "view_all",
        ],
    },
    {
        "id": "00000000-0000-0000-0000-a00000000003",
        "name": "hiring_manager",
        "description": "Review candidates and applications, add notes and feedback",
        "is_system": True,
        "permissions": ["view_all", "manage_notes"],
    },
    {
        "id": "00000000-0000-0000-0000-a00000000004",
        "name": "viewer",
        "description": "Read-only access to jobs, candidates, and applications",
        "is_system": True,
        "permissions": ["view_all"],
    },
]


def upgrade() -> None:
    roles_table = op.create_table(
        "roles",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", UUID(as_uuid=True), nullable=False, index=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.String(500), nullable=False, server_default=""),
        sa.Column("is_system", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("tenant_id", "name", name="uq_role_tenant_name"),
    )

    perms_table = op.create_table(
        "role_permissions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", UUID(as_uuid=True), nullable=False, index=True),
        sa.Column("role_id", UUID(as_uuid=True), sa.ForeignKey("roles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("permission", sa.String(100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("role_id", "permission", name="uq_role_perm"),
        sa.Index("ix_role_permissions_role", "role_id"),
    )

    import uuid as _uuid

    for role_def in SYSTEM_ROLES:
        op.bulk_insert(roles_table, [{
            "id": role_def["id"],
            "tenant_id": TENANT_ID,
            "name": role_def["name"],
            "description": role_def["description"],
            "is_system": role_def["is_system"],
        }])
        rows = []
        for perm in role_def["permissions"]:
            rows.append({
                "id": str(_uuid.uuid4()),
                "tenant_id": TENANT_ID,
                "role_id": role_def["id"],
                "permission": perm,
            })
        if rows:
            op.bulk_insert(perms_table, rows)


def downgrade() -> None:
    op.drop_table("role_permissions")
    op.drop_table("roles")
