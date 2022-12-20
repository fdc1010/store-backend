CREATE TABLE `products` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `category_id` integer NOT NULL,
  `brand_id` integer NOT NULL,
  `merchant_id` integer NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `price` double NOT NULL,
  `available_qty` integer NOT NULL,
  `sku` varchar(255) NOT NULL,
  `status` tinyint NOT NULL,
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `product_assets` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `product_id` integer NOT NULL,
  `asset_id` integer NOT NULL
);

CREATE TABLE `assets` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `is_image` tinyint NOT NULL,
  `filename` varchar(255) NOT NULL,
  `file_size` integer NOT NULL,
  `file_extension` varchar(255) NOT NULL,
  `image_dimensions` varchar(255) NOT NULL,
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `product_categories` (
  `product_id` integer NOT NULL,
  `category_id` integer NOT NULL
);

CREATE TABLE `categories` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `status` tinyint NOT NULL,
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `brands` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `status` tinyint NOT NULL
);

CREATE TABLE `users` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `role_id` integer NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `contact_no` varchar(255),
  `salutation` varchar(255),
  `birth_date` datetime,
  `gender` varchar(255),
  `status` tinyint NOT NULL,
  `is_store_user` boolean NOT NULL,
  `reset_code` varchar(16),
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `vouchers` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `conditions` varchar(255) NOT NULL,
  `validity` datetime NOT NULL,
  `is_amount_or_percentage` tinyint NOT NULL,
  `percentage` double NOT NULL,
  `amount` double NOT NULL,
  `status` tinyint NOT NULL,
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `dashboard_users` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `role_id` integer NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `status` tinyint NOT NULL
);

CREATE TABLE `roles` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` tinyint NOT NULL
);

CREATE TABLE `cart_items` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `cart_id` integer NOT NULL,
  `product_id` integer NOT NULL,
  `quantity` integer NOT NULL,
  `item_price` double NOT NULL
);

CREATE TABLE `carts` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` integer,
  `session_id` varchar(255),
  `guid` varchar(255) NOT NULL,
  `status` tinyint NOT NULL,
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `orders` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `cart_id` integer NOT NULL,
  `session_id` varchar(255),
  `user_id` integer,
  `order_reference` varchar(255) NOT NULL,
  `order_total` double NOT NULL,
  `order_status` tinyint NOT NULL,
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `order_items` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `order_id` integer NOT NULL,
  `product_id` integer NOT NULL,
  `quantity` integer NOT NULL,
  `item_price` double NOT NULL
);

CREATE TABLE `payments` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `order_id` integer NOT NULL,
  `gateway_transaction_id` varchar(255) NOT NULL,
  `amount_paid` double NOT NULL,
  `approval_code` varchar(255),
  `processed_date` datetime,
  `is_refunded` boolean,
  `refunded_at` datetime,
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `billing_details` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `order_id` integer NOT NULL,
  `user_id` integer NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact_no` varchar(255) NOT NULL,
  `address1` varchar(255) NOT NULL,
  `address2` varchar(255),
  `city` varchar(255) NOT NULL,
  `postal_code` integer NOT NULL,
  `contact_number` varchar(255)
);

CREATE TABLE `shipping_details` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `order_id` integer NOT NULL,
  `user_id` integer NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact_no` varchar(255) NOT NULL,
  `address1` varchar(255) NOT NULL,
  `address2` varchar(255),
  `city` varchar(255) NOT NULL,
  `postal_code` double NOT NULL,
  `contact_number` varchar(255)
);

CREATE TABLE `merchants` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` integer NOT NULL,
  `name` varchar(255) NOT NULL,
  `office_phone_number` varchar(255) NOT NULL,
  `office_address` varchar(255) NOT NULL,
  `acra_number` varchar(255) NOT NULL,
  `acra_business_profile` varchar(255) NOT NULL,
  `status` tinyint NOT NULL DEFAULT(0)
);

ALTER TABLE `product_assets` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

ALTER TABLE `product_categories` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

ALTER TABLE `product_assets` ADD FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`);

ALTER TABLE `products` ADD FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`);

ALTER TABLE `products` ADD FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

ALTER TABLE `products` ADD FOREIGN KEY (`merchant_id`) REFERENCES `dashboard_users` (`id`);

ALTER TABLE `dashboard_users` ADD FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

ALTER TABLE `order_items` ADD FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

ALTER TABLE `order_items` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

ALTER TABLE `carts` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `cart_items` ADD FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`);

ALTER TABLE `cart_items` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

ALTER TABLE `payments` ADD FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

ALTER TABLE `billing_details` ADD FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

ALTER TABLE `billing_details` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `shipping_details` ADD FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

ALTER TABLE `shipping_details` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `orders` ADD FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`);

ALTER TABLE `orders` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `users` ADD FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

ALTER TABLE `merchants` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);