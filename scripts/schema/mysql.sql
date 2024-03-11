CREATE TABLE IF NOT EXISTS guilds
(
    guild_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (guild_id)
);

CREATE TABLE IF NOT EXISTS channels
(
    guild_id     VARCHAR(36)                      NOT NULL,
    channel_id   VARCHAR(36),
    channel_type ENUM ('leave', 'log', 'welcome') NOT NULL,
    PRIMARY KEY (guild_id, channel_id, channel_type),
    FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invites
(
    guild_id   VARCHAR(36) NOT NULL,
    inviter_id VARCHAR(36) NOT NULL,
    member_id  VARCHAR(36) NOT NULL,
    code       VARCHAR(15) NOT NULL,
    inactive   BOOLEAN     NOT NULL DEFAULT false,
    fake       BOOLEAN     NOT NULL DEFAULT false,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invites_exclude
(
    guild_id      VARCHAR(36)             NOT NULL,
    excluded_type ENUM ('role', 'member') NOT NULL,
    excluded_id   VARCHAR(36)             NOT NULL,
    can_invite    BOOLEAN                 NOT NULL DEFAULT true,
    is_invitation BOOLEAN                 NOT NULL DEFAULT false,
    PRIMARY KEY (guild_id, excluded_id),
    FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leaderboards
(
    guild_id          VARCHAR(36) NOT NULL,
    view_top          INT         NOT NULL DEFAULT 10,
    view_left_inviter BOOLEAN     NOT NULL DEFAULT true,
    PRIMARY KEY (guild_id),
    FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leaderboards_exclude
(
    guild_id      INT                     NOT NULL,
    excluded_type ENUM ('role', 'member') NOT NULL,
    excluded_id   VARCHAR(36)             NOT NULL,
    PRIMARY KEY (guild_id, excluded_id),
    FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roles
(
    guild_id           VARCHAR(36) NOT NULL,
    role_id            VARCHAR(36) NOT NULL,
    amount_invitations INT         NOT NULL,
    PRIMARY KEY (guild_id, role_id),
    FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS links
(
    guild_id  VARCHAR(36) NOT NULL,
    member_id VARCHAR(36) NOT NULL,
    link      VARCHAR(36) NOT NULL,
    source    VARCHAR(255),
    PRIMARY KEY (link),
    FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fakes
(
    guild_id              VARCHAR(36) NOT NULL,
    role_id               VARCHAR(36),
    custom_profile_pic    BOOLEAN     NOT NULL DEFAULT false,
    older                 INT         NOT NULL DEFAULT 10,
    own_invite            BOOLEAN     NOT NULL DEFAULT true,
    first_join            BOOLEAN     NOT NULL DEFAULT false,
    back_original_inviter BOOLEAN     NOT NULL DEFAULT false,
    PRIMARY KEY (guild_id),
    FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE CASCADE
);
