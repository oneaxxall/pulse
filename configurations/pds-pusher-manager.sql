CREATE TABLE IF NOT EXISTS `pusher_manager` (
    `id` varchar(255) NOT NULL,
    `key` varchar(255) NOT NULL,
    `secret` varchar(255) NOT NULL,
    `max_connections` integer(10) NOT NULL,
    `enable_client_messages` tinyint(1) NOT NULL,
    `enabled` tinyint(1) NOT NULL,
    `max_backend_events_per_sec` integer(10) NOT NULL,
    `max_client_events_per_sec` integer(10) NOT NULL,
    `max_read_req_per_sec` integer(10) NOT NULL,
    `webhooks` json,
    `max_presence_members_per_channel` tinyint(1) NULL,
    `max_presence_member_size_in_kb` tinyint(1) NULL,
    `max_channel_name_length` tinyint(1) NULL,
    `max_event_channels_at_once` tinyint(1) NULL,
    `max_event_name_length` tinyint(1) NULL,
    `max_event_payload_in_kb` tinyint(1) NULL,
    `max_event_batch_size` tinyint(1) NULL,
    `enable_user_authentication` tinyint(1) NOT NULL,
    PRIMARY KEY (`id`)
);

-- Tabel untuk pencatatan log pengiriman webhook
-- Diisi otomatis oleh WebhookLogger jika PDSPUSHER_WEBHOOKS_LOGS_ENABLED=true
-- dan PDSPUSHER_WEBHOOKS_LOGS_DB_ENABLED=true
CREATE TABLE IF NOT EXISTS `pusher_webhook_logs` (
    `id`              bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    `app_key`         varchar(255) NOT NULL COMMENT 'App key yang mengirim webhook',
    `webhook_url`     text NOT NULL COMMENT 'URL tujuan webhook',
    `status`          enum('success','failed') NOT NULL COMMENT 'Status pengiriman',
    `event_types`     json NOT NULL COMMENT 'Daftar event type yang dikirim',
    `payload_size`    int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Ukuran payload dalam bytes',
    `response_status` smallint(5) UNSIGNED NULL DEFAULT NULL COMMENT 'HTTP response code dari target',
    `duration_ms`     int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Durasi pengiriman dalam milidetik',
    `error`           text NULL DEFAULT NULL COMMENT 'Pesan error jika gagal',
    `created_at`      datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pencatatan',
    PRIMARY KEY (`id`),
    INDEX `idx_app_key` (`app_key`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Log pengiriman webhook oleh PDS Pusher Server';
