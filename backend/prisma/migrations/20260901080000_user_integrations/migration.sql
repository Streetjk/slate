-- CreateTable
CREATE TABLE `user_integrations` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(64) NOT NULL,
    `encrypted_access_token` TEXT NOT NULL,
    `encrypted_token_cache` TEXT NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `scopes` VARCHAR(512) NOT NULL,
    `account_email` VARCHAR(320) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_integrations_user_id_provider_key`(`user_id`, `provider`),
    INDEX `user_integrations_provider_idx`(`provider`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_integrations` ADD CONSTRAINT `user_integrations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
