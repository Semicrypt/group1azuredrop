CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    original_name TEXT NOT NULL,

    blob_name TEXT NOT NULL UNIQUE,

    container_name TEXT NOT NULL,

    mime_type VARCHAR(255) NOT NULL,

    size_bytes BIGINT NOT NULL,

    category VARCHAR(100),

    description TEXT,

    storage_provider VARCHAR(50)
        NOT NULL
        DEFAULT 'azure_blob',

    uploaded_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_files_user_id
ON files(user_id);

CREATE INDEX IF NOT EXISTS idx_files_category
ON files(category);

CREATE INDEX IF NOT EXISTS idx_files_original_name
ON files(original_name);

CREATE INDEX IF NOT EXISTS idx_files_container_name
ON files(container_name);


CREATE TABLE IF NOT EXISTS share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    file_id UUID NOT NULL
        REFERENCES files(id)
        ON DELETE CASCADE,

    token TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_share_links_token
ON share_links(token);

CREATE INDEX IF NOT EXISTS idx_share_links_expires_at
ON share_links(expires_at);