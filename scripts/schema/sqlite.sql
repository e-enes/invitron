CREATE TABLE IF NOT EXISTS guilds
(
    guild_id TEXT NOT NULL,
    language TEXT NOT NULL CHECK (language IN ('en', 'fr', 'nl', 'ru', 'vi')),
    PRIMARY KEY (guild_id)
);

CREATE TABLE IF NOT EXISTS channels
(
    guild_id     TEXT NOT NULL,
    channel_id   TEXT NOT NULL,
    channel_type TEXT NOT NULL CHECK (channel_type IN ('leave', 'join')),
    active       BOOL NOT NULL DEFAULT true,
    PRIMARY KEY (guild_id, channel_id, channel_type),
    FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invites
(
    guild_id   TEXT     NOT NULL,
    inviter_id TEXT,
    member_id  TEXT     NOT NULL,
    code       TEXT,
    inactive   BOOL     NOT NULL DEFAULT false,
    fake       BOOL     NOT NULL DEFAULT false,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bonus
(
    guild_id   TEXT     NOT NULL,
    inviter_id TEXT     NOT NULL,
    bonus      INTEGER  NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leaderboards
(
    guild_id             TEXT    NOT NULL,
    display_top          INTEGER NOT NULL DEFAULT 10,
    display_left_inviter BOOL    NOT NULL DEFAULT false,
    PRIMARY KEY (guild_id),
    FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leaderboards_exclude
(
    guild_id      INTEGER NOT NULL,
    excluded_type TEXT    NOT NULL CHECK (excluded_type IN ('role', 'member')),
    excluded_id   TEXT    NOT NULL,
    PRIMARY KEY (guild_id, excluded_id),
    FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roles
(
    guild_id           TEXT    NOT NULL,
    role_id            TEXT    NOT NULL,
    number_invitations INTEGER NOT NULL,
    active             BOOL    NOT NULL DEFAULT true,
    PRIMARY KEY (guild_id, role_id),
    FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roles_configuration
(
    guild_id     TEXT NOT NULL,
    keep_role    BOOL NOT NULL DEFAULT false,
    stacked_role BOOL NOT NULL DEFAULT true,
    PRIMARY KEY (guild_id),
    FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS links
(
    guild_id  TEXT NOT NULL,
    member_id TEXT NOT NULL,
    link      TEXT NOT NULL,
    source    TEXT NULL,
    PRIMARY KEY (link),
    FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fakes
(
    guild_id              TEXT NOT NULL,
    role_id               TEXT,
    custom_profile_pic    BOOL NOT NULL DEFAULT false,
    older                 INT  NOT NULL DEFAULT 10,
    own_invite            BOOL NOT NULL DEFAULT true,
    first_join            BOOL NOT NULL DEFAULT false,
    back_original_inviter BOOL NOT NULL DEFAULT false,
    PRIMARY KEY (guild_id),
    FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE CASCADE
);
