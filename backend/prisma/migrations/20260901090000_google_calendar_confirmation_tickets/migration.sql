-- CreateTable
CREATE TABLE `google_calendar_confirmation_tickets` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `ticket_hash` CHAR(64) NOT NULL,
    `proposal` JSON NOT NULL,
    `calendar_id` VARCHAR(256) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `consumed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `google_calendar_confirmation_tickets_ticket_hash_key`(`ticket_hash`),
    INDEX `google_calendar_confirmation_tickets_user_id_expires_at_idx`(`user_id`, `expires_at`),
    INDEX `google_calendar_confirmation_tickets_user_id_consumed_at_idx`(`user_id`, `consumed_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `google_calendar_confirmation_tickets` ADD CONSTRAINT `google_calendar_confirmation_tickets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
