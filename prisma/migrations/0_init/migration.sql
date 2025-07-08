-- CreateTable
CREATE TABLE `coupon_templates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `type` VARCHAR(30) NOT NULL,
    `value` JSON NOT NULL,
    `usage_rules` JSON NOT NULL,
    `total_quantity` INTEGER NOT NULL DEFAULT -1,
    `issued_quantity` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `per_user_limit` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `issue_start_time` DATETIME(0) NULL,
    `issue_end_time` DATETIME(0) NULL,
    `validity_type` VARCHAR(20) NOT NULL,
    `valid_from` DATETIME(0) NULL,
    `valid_until` DATETIME(0) NULL,
    `valid_days_after_issue` INTEGER UNSIGNED NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'INACTIVE',
    `target_user_group` JSON NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_claim_center`(`status`, `issue_start_time`, `issue_end_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_coupons` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `template_id` BIGINT UNSIGNED NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'UNUSED',
    `acquired_at` DATETIME(0) NOT NULL,
    `expires_at` DATETIME(0) NOT NULL,
    `used_at` DATETIME(0) NULL,
    `used_order_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_user_status_expires`(`user_id`, `status`, `expires_at`),
    INDEX `idx_user_template`(`user_id`, `template_id`),
    INDEX `template_id`(`template_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_coupons` ADD CONSTRAINT `user_coupons_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `coupon_templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

