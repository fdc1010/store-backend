-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jul 01, 2021 at 04:52 AM
-- Server version: 8.0.25-0ubuntu0.20.04.1
-- PHP Version: 7.4.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_store`
--

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`id`, `date_created`, `title`, `description`, `url`, `image`, `image_mobile`, `type`, `sort_order`, `caption1`, `caption2`, `caption3`, `homepage_title`, `banner_type`, `publish_date_from`, `publish_date_to`, `url_mobile`, `redirect_type`, `redirect_ref_id`) VALUES
(136, '2021-06-30 00:00:00', 'phung banner', '1111', 'http://google.com', 'https://storage.googleapis.com/store-backend/banner/banner-32e3d8f1-f7e5-4c55-93d4-2d741a03e47f.png', 'https://storage.googleapis.com/store-backend/banner/banner-acb69bae-5cdc-4c6f-9614-f76c96f7d0b4.png', NULL, 1, '11', '11', '11', '11', 1, '2000-10-11 00:00:00', '2000-10-11 00:00:00', 'http://google.com', 1, NULL),
(137, '2021-06-30 00:00:00', 'Banner 13777sdsd', 'Banner 2 Descriptionssssas', 'https://www.example.com/', 'https://storage.googleapis.com/store-backend/banner/banner-f362a4a1-c021-46e1-9129-1c2d68afc801.png', 'https://storage.googleapis.com/store-backend/banner/banner-mobile-f362a4a1-c021-46e1-9129-1c2d68afc801.png', NULL, 1, 'Banner 2 Caption 1', 'Banner 2 Caption 2', 'Banner 2 Caption 3', 'Banner 1 Homepage TItle', 1, '2000-10-10 01:00:00', '2000-11-10 01:00:00', 'https://www.example.com/', 1, NULL),
(144, '2021-06-30 22:03:45', 'banner3', 'des', 'http://google.com', 'https://storage.googleapis.com/store-backend/banner/banner-822e73c9-a415-413b-b589-cd2ea675e509.png', 'https://storage.googleapis.com/store-backend/banner/banner-mobile-822e73c9-a415-413b-b589-cd2ea675e509.png', NULL, 1, 'cap1', 'cap22', 'aaa', 'aaaa', 1, '2021-06-30 08:00:00', '2021-06-26 08:00:00', 'http://google.com', 1, NULL);

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `voucher_id`, `user_id`, `session_id`, `status`, `created_at`, `updated_at`) VALUES
(1, NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJuYW1lIjoiSU9TIiwiZW1haWwiOiJpb3NAeW9wbWFpbC5jb20ifSwiZXhwIjoxNjI0NTg2OTY4LCJpYXQiOjE2MjM5ODIxNjh9.ngkOMOPfnPsSle7X4ZjbaVgQYtV-wo_WGSzvIWe7J6s', 1, '2021-06-18 02:31:13', '2021-06-18 02:31:13'),
(2, NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJuYW1lIjoiSU9TIiwiZW1haWwiOiJpb3NAeW9wbWFpbC5jb20ifSwiZXhwIjoxNjI0NTg4NjYzLCJpYXQiOjE2MjM5ODM4NjN9.8SWt1XM8rPO2tlM3L1vkC4RAfLBGB_hy7CzdQEMeejA', 1, '2021-06-18 02:38:37', '2021-06-18 02:38:37'),
(3, NULL, NULL, '1', 1, '2021-06-22 16:57:32', '2021-06-22 16:57:32'),
(4, NULL, NULL, 'test', 1, '2021-06-22 17:19:56', '2021-06-22 17:19:56'),
(5, NULL, NULL, 'a', 1, '2021-06-22 18:44:04', '2021-06-22 18:44:04'),
(6, NULL, 1, NULL, 1, '2021-06-22 18:46:11', '2021-06-22 18:46:11'),
(7, NULL, 5, NULL, 1, '2021-06-24 10:18:04', '2021-06-24 10:18:04'),
(8, NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxNiwibmFtZSI6ImlpaWkiLCJlbWFpbCI6ImlvczVAeW9wbWFpbC5jb20ifSwiZXhwIjoxNjI0OTM2MzEwLCJpYXQiOjE2MjQzMzE1MTB9.ETUFcvlkVaqLakBHEEH41_YFJN3eV16KSe0Ogd_I4KA', 1, '2021-06-25 16:08:17', '2021-06-25 16:08:17'),
(9, NULL, 16, NULL, 1, '2021-06-25 16:28:07', '2021-06-25 16:28:07'),
(10, NULL, NULL, '0bc785c35f748704', 1, '2021-06-25 16:36:44', '2021-06-25 16:36:44'),
(11, NULL, 19, NULL, 1, '2021-06-27 01:13:21', '2021-06-27 01:13:21'),
(12, NULL, 20, NULL, 1, '2021-06-29 13:35:41', '2021-06-29 13:35:41'),
(13, NULL, 28, NULL, 1, '2021-07-01 10:43:19', '2021-07-01 10:43:19'),
(14, NULL, 29, NULL, 1, '2021-07-01 11:46:35', '2021-07-01 11:46:35');

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `cart_id`, `product_id`, `variant`, `quantity`, `item_price`, `shipping_price`) VALUES
(1, 4, 38, NULL, 5, 342, 0),
(10, 8, 40, NULL, 5, 342, 0),
(16, 9, 40, NULL, 5, 342, 0),
(17, 9, 39, NULL, 5, 342, 0),
(25, 12, 38, NULL, 2, 342, 0);

--
-- Dumping data for table `email_notifications`
--

INSERT INTO `email_notifications` (`id`, `user_id`, `order_updates`, `newsletters`, `status`, `created_at`, `updated_at`) VALUES
(3, 20, 0, 0, 1, '2021-06-29 13:35:36', '2021-06-29 13:35:36'),
(4, 27, 0, 0, 1, '2021-07-01 10:17:07', '2021-07-01 10:17:07'),
(5, 28, 0, 0, 1, '2021-07-01 10:43:14', '2021-07-01 10:43:14'),
(6, 29, 0, 0, 1, '2021-07-01 11:46:28', '2021-07-01 11:46:28');

--
-- Dumping data for table `merchants`
--

INSERT INTO `merchants` (`id`, `user_id`, `code`, `name`, `office_phone_number`, `office_address`, `acra_number`, `acra_business_profile`, `status`) VALUES
(1, 1, 'M-000004', 'Google Company', '+6510000000', 'tset', '100000000', 'https://storage.googleapis.com/store-backend/acra/company-baby-72d8087b-8d10-45b0-be4f-406a6a1d927b.jpg', 1),
(4, 4, 'M-000004', 'Apple Company', '+6510000000', 'tset', '100000000', 'https://storage.googleapis.com/store-backend/acra/company-baby-72d8087b-8d10-45b0-be4f-406a6a1d927b.jpg', 1),
(6, 6, 'M-000001', 'Miqdad Corp', '9736182383', 'Lorem ipsum', '1726381273', 'https://storage.googleapis.com/store-backend/acra/miqdad-corp-58128df7-f59b-4bf2-a7e4-4a1819cae422.png', 0),
(13, 13, 'M-000002', 'Company Baby', '+6512345678', '123 abc', '123456789', 'https://storage.googleapis.com/store-backend/acra/company-baby-72d8087b-8d10-45b0-be4f-406a6a1d927b.jpg', 1),
(14, 21, 'M-000005', 'MerchantName Phung', '0909888154', '54 Singapore #123', '12345678', 'https://storage.googleapis.com/store-backend/acra/merchantname-phung-ff1b67f5-a985-41a0-99c0-9296fd1fdeb4', 1),
(15, 22, 'M-000006', 'merchant phung', '0909888154', '65 singapire', '123123', 'https://storage.googleapis.com/store-backend/acra/merchant-phung-667845cb-7b1f-48b4-8b1d-ef39e0ecdd2f', 0),
(16, 23, 'M-000007', 'phung merchan a', '0909888154', '65 singapore', '112233', 'https://storage.googleapis.com/store-backend/acra/phung-merchan-a-9b23a515-6ab2-4df9-ac96-af13a7ccecde', 0),
(17, 24, 'M-000008', 'phung merchant hello', '0909888154', '4 singapore', '123123123', 'https://storage.googleapis.com/store-backend/acra/phung-merchant-hello-0c55fe43-1e75-4a17-970e-d1093b29b262', 0),
(18, 25, 'M-000009', 'aaa', '01716920198', 'a', '1232323', 'https://storage.googleapis.com/store-backend/acra/aaa-6eea1e8a-b6a3-4863-a9f1-5f2e253c5519', 0),
(19, 26, 'M-000010', 'test', '01716920198', 'asfddasfaf', '12212', 'https://storage.googleapis.com/store-backend/acra/test-23ffa346-d358-4416-bbaa-1ae82397ae5d', 1);

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `target_user_id`, `ref_id`, `type`, `is_read`, `status`, `title`, `description`, `summary`, `thumbnail`, `action`, `created_at`, `updated_at`) VALUES
(1, 13, 4, 76, 1, 1, 1, 'Someone likes your product', 'fred carz  likes your product', 'fred carz  likes Boy product', NULL, NULL, '2021-06-28 00:41:55', '2021-06-28 00:41:55'),
(2, 1, 1, 77, 1, 1, 1, 'Someone likes your product', 'SuperAdmin  likes your product', 'SuperAdmin  likes SuperAdmin product', NULL, NULL, '2021-06-28 18:06:08', '2021-06-28 18:06:08'),
(3, 1, 20, 78, 1, 1, 1, 'Someone likes your product', 'Danhios  likes your product', 'Danhios  likes SuperAdmin product', NULL, NULL, '2021-06-29 13:39:30', '2021-06-29 13:39:30'),
(4, 1, 20, 79, 1, 1, 1, 'Someone likes your product', 'Danhios  likes your product', 'Danhios  likes SuperAdmin product', NULL, NULL, '2021-06-29 13:39:38', '2021-06-29 13:39:38'),
(5, 1, 1, 80, 1, 1, 1, 'Someone likes your product', 'SuperAdmin  likes your product', 'SuperAdmin  likes SuperAdmin product', NULL, NULL, '2021-06-29 14:57:16', '2021-06-29 14:57:16'),
(6, 1, 1, 81, 1, 1, 1, 'Someone likes your product', 'SuperAdmin  likes your product', 'SuperAdmin  likes SuperAdmin product', NULL, NULL, '2021-06-29 17:15:52', '2021-06-29 17:15:52'),
(7, 4, 1, 82, 1, 1, 1, 'Someone likes your product', 'SuperAdmin  likes your product', 'SuperAdmin  likes fred carz product', NULL, NULL, '2021-06-29 19:10:17', '2021-06-29 19:10:17'),
(8, 1, 1, 83, 1, 1, 1, 'Someone likes your product', 'SuperAdmin  likes your product', 'SuperAdmin  likes SuperAdmin product', NULL, NULL, '2021-06-30 01:53:11', '2021-06-30 01:53:11'),
(9, 1, 1, 84, 1, 1, 1, 'Someone likes your product', 'SuperAdmin  likes your product', 'SuperAdmin  likes SuperAdmin product', NULL, NULL, '2021-06-30 11:22:35', '2021-06-30 11:22:35'),
(10, 1, 1, 85, 1, 1, 1, 'Someone likes your product', 'SuperAdmin  likes your product', 'SuperAdmin  likes SuperAdmin product', NULL, NULL, '2021-06-30 12:13:32', '2021-06-30 12:13:32'),
(11, 1, 1, 86, 1, 1, 1, 'Someone likes your product', 'SuperAdmin  likes your product', 'SuperAdmin  likes SuperAdmin product', NULL, NULL, '2021-06-30 22:43:56', '2021-06-30 22:43:56'),
(12, 1, 1, 87, 1, 1, 1, 'Someone likes your product', 'SuperAdmin  likes your product', 'SuperAdmin  likes SuperAdmin product', NULL, NULL, '2021-06-30 23:22:22', '2021-06-30 23:22:22'),
(13, 1, 1, 88, 1, 1, 1, 'Someone likes your product', 'SuperAdmin  likes your product', 'SuperAdmin  likes SuperAdmin product', NULL, NULL, '2021-06-30 23:51:35', '2021-06-30 23:51:35'),
(14, 1, 1, 89, 1, 1, 1, 'Someone likes your product', 'SuperAdmin  likes your product', 'SuperAdmin  likes SuperAdmin product', NULL, NULL, '2021-06-30 23:51:41', '2021-06-30 23:51:41'),
(15, 1, 1, 90, 1, 1, 1, 'Someone likes your product', 'SuperAdmin  likes your product', 'SuperAdmin  likes SuperAdmin product', NULL, NULL, '2021-06-30 23:51:46', '2021-06-30 23:51:46'),
(16, 1, 1, 91, 1, 1, 1, 'Someone likes your product', 'SuperAdmin  likes your product', 'SuperAdmin  likes SuperAdmin product', NULL, NULL, '2021-06-30 23:51:56', '2021-06-30 23:51:56'),
(17, 4, 1, 92, 1, 1, 1, 'Someone likes your product', 'SuperAdmin  likes your product', 'SuperAdmin  likes fred carz product', NULL, NULL, '2021-06-30 23:52:14', '2021-06-30 23:52:14'),
(18, 4, 1, 93, 1, 1, 1, 'Someone likes your product', 'SuperAdmin  likes your product', 'SuperAdmin  likes fred carz product', NULL, NULL, '2021-06-30 23:52:23', '2021-06-30 23:52:23'),
(19, 4, 1, 94, 1, 1, 1, 'Someone likes your product', 'SuperAdmin  likes your product', 'SuperAdmin  likes fred carz product', NULL, NULL, '2021-06-30 23:52:32', '2021-06-30 23:52:32'),
(20, 1, 5, 95, 1, 1, 1, 'Someone likes your product', 'test  likes your product', 'test  likes SuperAdmin product', NULL, NULL, '2021-07-01 07:05:20', '2021-07-01 07:05:20'),
(21, 1, 5, 96, 1, 1, 1, 'Someone likes your product', 'test  likes your product', 'test  likes SuperAdmin product', NULL, NULL, '2021-07-01 07:05:29', '2021-07-01 07:05:29'),
(22, 1, 5, 97, 1, 1, 1, 'Someone likes your product', 'test  likes your product', 'test  likes SuperAdmin product', NULL, NULL, '2021-07-01 07:05:43', '2021-07-01 07:05:43'),
(23, 1, 5, 98, 1, 1, 1, 'Someone likes your product', 'test  likes your product', 'test  likes SuperAdmin product', NULL, NULL, '2021-07-01 07:05:53', '2021-07-01 07:05:53'),
(24, 1, 28, 99, 1, 1, 1, 'Someone likes your product', 'esther  likes your product', 'esther  likes SuperAdmin product', NULL, NULL, '2021-07-01 10:43:56', '2021-07-01 10:43:56');

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `voucher_id`, `code`, `session_id`, `total`, `status`, `payment_url`, `token`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 'ORD-000001', NULL, 1026, 0, NULL, NULL, '2021-06-25 17:47:58', '2021-06-25 17:47:58'),
(2, 1, NULL, 'ORD-000002', NULL, 1026, 0, NULL, NULL, '2021-06-25 17:49:16', '2021-06-25 17:49:16'),
(3, NULL, NULL, 'ORD-000003', 'test', 1710, 0, NULL, NULL, '2021-06-29 08:22:01', '2021-06-29 08:22:01'),
(4, NULL, NULL, 'ORD-000004', 'test', 1710, 0, NULL, NULL, '2021-06-29 08:24:36', '2021-06-29 08:24:36'),
(5, NULL, NULL, 'ORD-000005', 'test', 1710, 0, NULL, NULL, '2021-06-29 08:28:20', '2021-06-29 08:28:20'),
(6, NULL, NULL, 'ORD-000006', 'test', 1710, 0, 'https://securecheckout.sandbox.hit-pay.com/payment-request/@store-backend/93c944ea-1e3d-425a-993d-a3d1436d9d35/checkout', '93c944ea-1e3d-425a-993d-a3d1436d9d35', '2021-06-29 08:28:58', '2021-06-29 08:28:59'),
(7, NULL, NULL, 'ORD-000007', 'test', 1710, 1, 'https://securecheckout.sandbox.hit-pay.com/payment-request/@store-backend/93c946e4-07b5-4cb8-a9e1-6f517751fadf/checkout', '93c946e4-07b5-4cb8-a9e1-6f517751fadf', '2021-06-29 08:34:29', '2021-06-29 08:34:49');

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `variant`, `quantity`, `item_price`) VALUES
(1, 1, 40, NULL, 2, 342),
(2, 1, 39, NULL, 1, 342),
(3, 2, 40, NULL, 2, 342),
(4, 2, 39, NULL, 1, 342),
(5, 3, 38, NULL, 5, 342),
(6, 4, 38, NULL, 5, 342),
(7, 5, 38, NULL, 5, 342),
(8, 6, 38, NULL, 5, 342),
(9, 7, 38, NULL, 5, 342);

--
-- Dumping data for table `order_logs`
--

INSERT INTO `order_logs` (`id`, `order_id`, `title`, `type`, `created_at`, `updated_at`) VALUES
(1, 1, 'Order has been created', '0', '2021-06-25 17:47:58', '2021-06-25 17:47:58'),
(2, 2, 'Order has been created', '0', '2021-06-25 17:49:16', '2021-06-25 17:49:16'),
(3, 3, 'Order has been created', '0', '2021-06-29 08:22:01', '2021-06-29 08:22:01'),
(4, 4, 'Order has been created', '0', '2021-06-29 08:24:36', '2021-06-29 08:24:36'),
(5, 5, 'Order has been created', '0', '2021-06-29 08:28:20', '2021-06-29 08:28:20'),
(6, 6, 'Order has been created', '0', '2021-06-29 08:28:58', '2021-06-29 08:28:58'),
(7, 7, 'Order has been created', '0', '2021-06-29 08:34:29', '2021-06-29 08:34:29'),
(8, 7, 'Order successfully paid', '0', '2021-06-29 08:34:49', '2021-06-29 08:34:49'),
(9, 7, 'Order successfully paid', '0', '2021-06-29 08:35:02', '2021-06-29 08:35:02'),
(10, 7, 'Order successfully paid', '0', '2021-06-29 08:36:03', '2021-06-29 08:36:03'),
(11, 7, 'Order successfully paid', '0', '2021-06-29 08:38:02', '2021-06-29 08:38:02'),
(12, 7, 'Order successfully paid', '0', '2021-06-29 08:39:03', '2021-06-29 08:39:03');

--
-- Dumping data for table `order_payment_logs`
--

INSERT INTO `order_payment_logs` (`id`, `order_id`, `transaction_id`, `response`, `created_at`, `updated_at`) VALUES
(1, 6, '93c944ea-1e3d-425a-993d-a3d1436d9d35', '{\"id\": \"93c944ea-1e3d-425a-993d-a3d1436d9d35\", \"url\": \"https://securecheckout.sandbox.hit-pay.com/payment-request/@store-backend/93c944ea-1e3d-425a-993d-a3d1436d9d35/checkout\", \"name\": null, \"email\": null, \"phone\": null, \"amount\": \"1,710.00\", \"status\": \"pending\", \"purpose\": null, \"webhook\": \"http://store-backend.fdc/order/_webhook/hitpay\", \"currency\": \"SGD\", \"send_sms\": true, \"created_at\": \"2021-06-29T08:28:59\", \"send_email\": false, \"sms_status\": \"pending\", \"updated_at\": \"2021-06-29T08:28:59\", \"expiry_date\": null, \"email_status\": \"pending\", \"redirect_url\": null, \"payment_methods\": [\"paynow_online\"], \"reference_number\": null, \"allow_repeated_payments\": false}', '2021-06-29 08:28:59', '2021-06-29 08:28:59'),
(2, 7, '93c946e4-07b5-4cb8-a9e1-6f517751fadf', '{\"id\": \"93c946e4-07b5-4cb8-a9e1-6f517751fadf\", \"url\": \"https://securecheckout.sandbox.hit-pay.com/payment-request/@store-backend/93c946e4-07b5-4cb8-a9e1-6f517751fadf/checkout\", \"name\": null, \"email\": null, \"phone\": null, \"amount\": \"1,710.00\", \"status\": \"pending\", \"purpose\": null, \"webhook\": \"http://store-backend-backend.fdc/order/_webhook/hitpay\", \"currency\": \"SGD\", \"send_sms\": true, \"created_at\": \"2021-06-29T08:34:30\", \"send_email\": false, \"sms_status\": \"pending\", \"updated_at\": \"2021-06-29T08:34:30\", \"expiry_date\": null, \"email_status\": \"pending\", \"redirect_url\": null, \"payment_methods\": [\"paynow_online\"], \"reference_number\": null, \"allow_repeated_payments\": false}', '2021-06-29 08:34:30', '2021-06-29 08:34:30'),
(3, 7, '93c946e4-07b5-4cb8-a9e1-6f517751fadf', '{\"hmac\": \"34ef180275b3598cea84a8f87c40e7939f28480cf09e60e1759347e7b243e735\", \"phone\": \"\", \"amount\": \"1710.00\", \"status\": \"completed\", \"currency\": \"SGD\", \"payment_id\": \"93c946e7-c1d1-4177-bdeb-f8e6fe52d865\", \"payment_request_id\": \"93c946e4-07b5-4cb8-a9e1-6f517751fadf\"}', '2021-06-29 08:34:49', '2021-06-29 08:34:49'),
(4, 7, '93c946e4-07b5-4cb8-a9e1-6f517751fadf', '{\"hmac\": \"34ef180275b3598cea84a8f87c40e7939f28480cf09e60e1759347e7b243e735\", \"phone\": \"\", \"amount\": \"1710.00\", \"status\": \"completed\", \"currency\": \"SGD\", \"payment_id\": \"93c946e7-c1d1-4177-bdeb-f8e6fe52d865\", \"payment_request_id\": \"93c946e4-07b5-4cb8-a9e1-6f517751fadf\"}', '2021-06-29 08:35:02', '2021-06-29 08:35:02'),
(5, 7, '93c946e4-07b5-4cb8-a9e1-6f517751fadf', '{\"hmac\": \"34ef180275b3598cea84a8f87c40e7939f28480cf09e60e1759347e7b243e735\", \"phone\": \"\", \"amount\": \"1710.00\", \"status\": \"completed\", \"currency\": \"SGD\", \"payment_id\": \"93c946e7-c1d1-4177-bdeb-f8e6fe52d865\", \"payment_request_id\": \"93c946e4-07b5-4cb8-a9e1-6f517751fadf\"}', '2021-06-29 08:36:02', '2021-06-29 08:36:02'),
(6, 7, '93c946e4-07b5-4cb8-a9e1-6f517751fadf', '{\"hmac\": \"34ef180275b3598cea84a8f87c40e7939f28480cf09e60e1759347e7b243e735\", \"phone\": \"\", \"amount\": \"1710.00\", \"status\": \"completed\", \"currency\": \"SGD\", \"payment_id\": \"93c946e7-c1d1-4177-bdeb-f8e6fe52d865\", \"payment_request_id\": \"93c946e4-07b5-4cb8-a9e1-6f517751fadf\"}', '2021-06-29 08:38:02', '2021-06-29 08:38:02'),
(7, 7, '93c946e4-07b5-4cb8-a9e1-6f517751fadf', '{\"hmac\": \"34ef180275b3598cea84a8f87c40e7939f28480cf09e60e1759347e7b243e735\", \"phone\": \"\", \"amount\": \"1710.00\", \"status\": \"completed\", \"currency\": \"SGD\", \"payment_id\": \"93c946e7-c1d1-4177-bdeb-f8e6fe52d865\", \"payment_request_id\": \"93c946e4-07b5-4cb8-a9e1-6f517751fadf\"}', '2021-06-29 08:39:03', '2021-06-29 08:39:03');

--
-- Dumping data for table `point_settings`
--

INSERT INTO `point_settings` (`id`, `name`, `description`, `points`, `status`, `created_at`, `updated_at`) VALUES
(1, '5 points', 'earn 5 point for every milk product orders', 5, 1, '2021-06-29 05:41:15', '2021-06-29 05:52:37'),
(2, '7 points', 'earn 7 points for every energy drink purchases', 2, 1, '2021-06-29 05:41:15', '2021-06-29 05:48:16'),
(3, '100 points', 'earn 100 points for every investments', 100, 1, '2021-06-29 05:41:15', '2021-06-29 05:43:13'),
(4, '1 point', 'earn 1 point for mobile app login per day (first login only in a day)', 1, 1, '2021-06-29 05:41:15', '2021-06-29 05:47:40');

--
-- Dumping data for table `prize_settings`
--

INSERT INTO `prize_settings` (`id`, `name`, `description`, `prizes`, `status`, `created_at`, `updated_at`) VALUES
(1, '15 SGD', '15 SGD spin value', 15, 1, '2021-06-29 01:57:45', '2021-06-29 02:09:56'),
(2, '20 SGD', '20 SGD spin value', 20, 1, '2021-06-29 01:57:45', '2021-06-29 02:06:10'),
(3, '25 SGD', '25 SGD spin value', 25, 1, '2021-06-29 01:58:42', '2021-06-29 02:09:49'),
(4, '30 SGD', '30 SGD spin value', 30, 1, '2021-06-29 01:58:42', '2021-06-29 02:10:09'),
(5, '10 SGD', '10 SGD spin value', 10, 1, '2021-06-29 01:59:17', '2021-06-29 02:10:13'),
(6, 'Try Again', 'Try Again spin value', 0, 1, '2021-06-29 01:59:17', '2021-06-29 02:10:34'),
(7, '5 SGD', '5 SGD spin value', 5, 1, '2021-06-29 01:59:51', '2021-06-29 02:10:40'),
(8, '1 SGD', '1 SGD spin value', 1, 1, '2021-06-29 01:59:51', '2021-06-29 02:10:29'),
(9, '100 SGD', '100 SGD spin value', 100, 1, '2021-06-29 02:00:23', '2021-06-29 02:10:17'),
(10, 'Thanks for Playing', 'Thanks for Playing spin value', 0, 1, '2021-06-29 02:00:23', '2021-06-29 02:10:24'),
(11, '5 points', 'earned 5 points equivalent', 5, 1, '2021-06-29 02:16:39', '2021-06-29 02:16:39'),
(12, '10 points', 'earned 10 points equivalent', 10, 1, '2021-06-29 02:16:39', '2021-06-29 02:16:59');

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `delivery_id`, `category_id`, `brand_id`, `merchant_id`, `name`, `code`, `variant`, `description`, `manufacturer`, `retail_price`, `sell_price`, `available_qty`, `status`, `email`, `phone_number`, `start_date`, `end_date`, `is_featured`, `is_recommended`, `is_hot`, `is_popular`, `is_new`, `is_top`, `likes`, `created_at`, `updated_at`) VALUES
(38, 1, 1, 1, 1, 'test 44 edited', 'P-0001', '[]', 'Spider-Man is a superhero created by writer-editor Stan Lee and writer-artist Steve Ditko. He first appeared in the anthology comic book Amazing Fantasy #15 (Aug. 1962) in the Silver Age of Comic Books. He appears in American comic books published by Marvel Comics, as well as in a number of movies, television shows, and video game adaptations set in the Marvel Universe. ', NULL, 342, 342, 150, 0, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 1, 0, 0, 0, 0, '2021-06-17 14:31:26', '2021-07-01 07:05:59'),
(39, 1, 1, 1, 1, 'test 44 edited', 'P-0002', '[]', 'Ste test desc', NULL, 342, 342, 150, 0, 'test@test.com', '92345678901', NULL, NULL, 0, 1, 0, 0, 0, 0, 0, '2021-06-17 14:32:13', '2021-07-01 00:10:00'),
(40, 1, 1, 1, 1, 'test 44 edited', 'P-0003', '[]', 'Thanos marvel infinity war', NULL, 342, 342, 150, 0, 'test@test.com', '92345678901', NULL, NULL, 0, 1, 1, 0, 0, 0, 1, '2021-06-17 14:33:31', '2021-07-01 10:43:59'),
(41, 1, 1, 1, 1, 'test 33', 'P-0004', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-17 14:35:46', '2021-06-30 16:19:05'),
(42, 1, 1, 1, 1, 'test 33', 'P-0005', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-17 14:38:58', '2021-06-30 16:19:05'),
(46, 1, 1, 1, 1, 'test 33', 'P-0009', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-17 15:35:56', '2021-06-30 16:19:05'),
(48, 1, 1, 1, 1, 'test 33', 'P-0011', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-18 03:38:11', '2021-06-30 16:19:05'),
(49, 1, 1, 1, 1, 'test 33', 'P-0012', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-18 03:39:48', '2021-06-30 16:19:05'),
(50, 1, 1, 1, 1, 'test 33', 'P-0013', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-18 04:01:16', '2021-06-30 16:19:05'),
(51, 1, 1, 1, 1, 'test 33', 'P-0014', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-18 04:02:06', '2021-06-30 16:19:05'),
(52, 1, 1, 1, 1, 'test 33', 'P-0015', '[]', 'test desc', NULL, 342, 342, 150, 1, 'ios@yopmail.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-18 04:02:38', '2021-06-30 16:19:05'),
(53, 1, 1, 1, 1, 'test 33', 'P-0016', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-18 04:05:29', '2021-06-30 16:19:05'),
(54, 1, 1, 1, 1, 'test 34', 'P-0017', '[]', 'test desc', NULL, 352, 352, 150, 1, 'test34@gmail.com', '92007860122', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-18 07:26:04', '2021-06-30 16:19:05'),
(55, 1, 1, 1, 1, 'test 34', 'P-0018', '[]', 'test desc', NULL, 352, 352, 150, 1, 'test34@gmail.com', '92007860122', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-18 09:22:23', '2021-06-30 16:19:05'),
(56, 1, 1, 1, 1, 'test 34', 'P-0019', '[]', 'test desc', NULL, 352, 352, 150, 1, 'test34@gmail.com', '92007860122', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-18 09:24:21', '2021-06-30 16:19:05'),
(57, 1, 1, 1, 1, 'test 34', 'P-0020', '[]', 'test desc', NULL, 352, 352, 150, 1, 'test34@gmail.com', '92007860122', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-18 09:28:12', '2021-06-30 16:19:05'),
(58, 1, 1, 1, 1, 'test 34', 'P-0021', '[]', 'test desc', NULL, 352, 352, 150, 1, 'test34@gmail.com', '92007860122', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-18 11:39:17', '2021-06-30 16:19:05'),
(59, 1, 1, 1, 1, 'test 34', 'P-0022', '[]', 'test desc', NULL, 352, 352, 150, 1, 'test34@gmail.com', '92007860122', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-18 11:56:55', '2021-06-30 16:19:05'),
(60, 1, 1, 1, 1, 'test 34', 'P-0023', '[]', 'test desc', NULL, 352, 352, 150, 1, 'test34@gmail.com', '92007860122', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-19 05:59:11', '2021-06-30 16:19:05'),
(61, 1, 1, 1, 1, 'test 34', 'P-0024', '[]', 'test desc', NULL, 352, 352, 150, 1, 'test34@gmail.com', '92007860122', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-19 05:59:13', '2021-06-30 16:19:05'),
(62, 1, 1, 1, 1, 'test 34', 'P-0025', '[]', 'test desc', NULL, 352, 352, 150, 1, 'test34@gmail.com', '92007860122', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-19 05:59:19', '2021-06-30 16:19:05'),
(63, 1, 1, 1, 4, 'prodfrank edited', 'P-0026', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', '2021-10-17 00:00:00', NULL, 0, 0, 0, 0, 0, 0, 1, '2021-06-19 14:44:06', '2021-06-30 16:19:05'),
(64, 1, 1, 1, 1, 'test 33', 'P-0027', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-19 15:58:54', '2021-06-30 16:19:05'),
(65, 1, 1, 1, 4, 'test 33', 'P-0028', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-20 08:47:29', '2021-06-30 16:19:05'),
(66, 1, 1, 1, 4, 'test 33', 'P-0029', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-20 08:50:37', '2021-06-30 16:19:05'),
(68, 1, 1, 1, 13, 'test 33', 'P-0031', '[]', 'test desc', NULL, 342, 342, 150, 0, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 1, '2021-06-20 08:52:35', '2021-06-30 16:19:05'),
(71, 1, 1, 1, 1, 'test 33', 'P-0034', '[]', 'test desc', NULL, 342, 342, 150, 0, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 1, '2021-06-20 09:08:55', '2021-06-30 16:19:05'),
(72, 1, 1, 1, 4, 'test 33', 'P-0035', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-20 17:18:01', '2021-06-30 16:19:05'),
(73, 1, 1, 1, 4, 'test 33', 'P-0035', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-21 13:19:12', '2021-06-30 16:19:05'),
(77, 1, 1, 1, 4, 'test 33', 'P-0039', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-21 13:27:22', '2021-06-30 16:19:05'),
(84, 1, 1, 1, 1, 'Coke', 'P-0045', '[]', 'Soft drink', NULL, 5, 6, 100, 1, 'help@coke.com', '92123456789', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-24 10:47:53', '2021-06-30 16:19:05'),
(86, 1, 1, 1, 1, 'test', 'P-0047', '[]', 'assa', NULL, 23, 34, 234, 1, 'assac@gmail.com', '12214433412', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-24 11:26:42', '2021-06-30 16:19:05'),
(87, 1, 1, 1, 1, 'test2', 'P-0048', '[]', 'asd', NULL, 22, 23, 233, 1, 'abc@test.com', '92123456789', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-24 11:52:55', '2021-06-30 16:19:05'),
(90, 1, 1, 1, 1, 'test 33', 'P-0051', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-24 13:31:01', '2021-06-30 16:19:05'),
(97, 1, 1, 1, 1, 'test 33', 'P-0097', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-24 17:54:30', '2021-06-30 16:19:05'),
(98, 1, 1, 1, 1, 'test 33', 'P-0098', '[]', 'test desc', NULL, 342, 342, 150, 1, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-24 17:54:50', '2021-06-30 16:19:05'),
(100, 1, 1, 1, 4, 'prod frank', 'P-0100', '[]', 'test desc', NULL, 342, 342, 150, 1, 'prodfrank@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-24 21:27:48', '2021-06-30 16:19:05'),
(101, 1, 1, 1, 4, 'prod frank', 'P-0101', '[]', 'test desc', NULL, 342, 342, 150, 1, 'prodfrank@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-24 21:30:31', '2021-06-30 16:19:05'),
(102, 1, 1, 1, 4, 'prod frank', 'P-0102', '[]', 'test desc', NULL, 342, 342, 150, 1, 'prodfrank@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-24 21:31:10', '2021-06-30 16:19:05'),
(103, 1, 1, 1, 4, 'prod frank', 'P-0103', '[]', 'test desc', NULL, 342, 342, 150, 1, 'prodfrank@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-24 21:32:14', '2021-06-30 16:19:05'),
(104, 1, 1, 1, 4, 'prod frank', 'P-0104', '[]', 'test desc', NULL, 342, 342, 150, 1, 'prodfrank@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-24 21:33:29', '2021-06-30 16:19:05'),
(105, 1, 1, 1, 4, 'prod frank', 'P-0105', '[]', 'test desc', NULL, 342, 342, 150, 0, 'prodfrank@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 1, '2021-06-24 21:35:30', '2021-06-30 16:19:05'),
(106, 1, 1, 1, 4, 'prod frank', 'P-0106', '[]', 'test desc', NULL, 342, 342, 150, 1, 'prodfrank@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-24 21:38:02', '2021-06-30 16:19:05'),
(107, 1, 1, 1, 4, 'prod frank', 'P-0107', '[]', 'test desc', NULL, 342, 342, 150, 0, 'prodfrank@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 1, '2021-06-24 21:38:35', '2021-06-30 16:19:05'),
(109, 1, 5, 1, 1, 'Milk', 'P-0109', '[]', 'Nestle Milkpack', NULL, 5, 6, 100, 1, 'help@nestle.com', '92123456789', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-25 11:50:25', '2021-06-30 16:19:05'),
(110, 1, 2, 1, 1, 'saa', 'P-0110', '[]', 'ssaf', NULL, 3, 4, 45, 1, 'abc@gmail.com', '92123456789', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-25 12:13:22', '2021-06-30 16:19:05'),
(112, 1, 1, 1, 1, 'Jeans', 'P-0112', '[]', 'Polo Jeans', NULL, 25, 30, 50, 1, 'help@polo.com', '92123456789', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-25 12:32:11', '2021-06-30 16:19:05'),
(114, 1, 1, 1, 1, 'SSD', 'P-0114', '[]', 'SSD for Laptop', NULL, 20, 25, 100, 1, 'pc@intl.com', '92111222333', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-25 13:20:30', '2021-06-30 16:19:05'),
(117, 1, 1, 1, 1, 'test 33', 'P-0115', '[]', 'test desc', NULL, 342, 342, 150, 0, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 1, '2021-06-28 13:10:55', '2021-06-30 16:19:05'),
(119, 1, 1, 1, 4, 'prod frank', 'P-0118', '[]', 'test desc', NULL, 342, 342, 150, 1, 'prodfrank@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-28 15:20:10', '2021-06-30 16:19:05'),
(120, 1, 1, 1, 4, 'prod frank', 'P-0120', '[]', 'test desc', NULL, 342, 342, 150, 0, 'prodfrank@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 1, '2021-06-28 15:21:16', '2021-06-30 16:19:05'),
(121, 1, 1, 1, 4, 'prod frank', 'P-0121', '[]', 'test desc', NULL, 342, 342, 150, 1, 'prodfrank@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, '2021-06-28 16:50:14', '2021-06-30 16:19:05'),
(122, 1, 5, 2, 4, 'Pro 122', 'P-0122', '[]', 'A product from Intel', NULL, 342, 342, 150, 0, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 1, '2021-06-28 16:57:11', '2021-06-30 16:19:05'),
(129, 1, 1, 1, 1, 'Spider man suite1', 'P-0123', '[]', 'Spider man suite for kid', NULL, 100, 500, 1111, 0, 'spider@yopmail.com', '+6512345678', NULL, NULL, 0, 0, 0, 0, 0, 0, 1, '2021-06-29 23:00:47', '2021-06-30 16:19:05'),
(130, 11, 1, 1, 1, 'testing', 'P-0130', '[]', 'dsfsdfsdfs', NULL, 100, 120, 50, 0, 'shojel@gmail.com', '12345678912', NULL, NULL, 0, 0, 0, 0, 0, 0, 1, '2021-06-30 15:07:45', '2021-06-30 16:19:05'),
(131, 1, 1, 1, 1, 'test 63 edited', 'P-0131', '[{\"name\": \"Size\", \"value\": [\"S\", \"M\", \"L\"]}]', 'test desc', NULL, 342, 342, 150, 0, 'test@test.com', '92345678901', NULL, NULL, 0, 0, 0, 0, 0, 0, 1, '2021-06-30 18:05:08', '2021-07-01 00:29:33');

--
-- Dumping data for table `product_assets`
--

INSERT INTO `product_assets` (`id`, `product_id`, `url`, `description`, `is_image`, `filename`, `file_size`, `file_extension`, `image_dimensions`, `created_at`, `updated_at`) VALUES
(1, 43, 'https://storage.googleapis.com/store-backend/product/test-33-2b663714-ff69-4a6b-8557-9b0dac89bb3e.png', NULL, 1, 'hand-closed.png', NULL, NULL, NULL, '2021-06-17 14:41:11', '2021-06-17 14:41:11'),
(2, 44, 'https://storage.googleapis.com/store-backend/product/test-33-2c849a5d-ae40-4e36-8c5a-8eb87230efb2.png', NULL, 1, 'hand-closed.png', NULL, NULL, NULL, '2021-06-17 14:46:47', '2021-06-17 14:46:47'),
(3, 45, 'https://storage.googleapis.com/store-backend/product/test-33-7beb636c-f2ac-4697-8259-71bc25f14d4d.png', NULL, 1, 'hand-closed.png', NULL, NULL, NULL, '2021-06-17 14:59:22', '2021-06-17 14:59:22'),
(4, 46, 'https://storage.googleapis.com/store-backend/product/test-33-bfa843ea-0e10-40d0-b3d0-4dd9f14f8874.png', NULL, 1, 'hand-closed.png', NULL, NULL, NULL, '2021-06-17 15:35:57', '2021-06-17 15:35:57'),
(5, 47, 'https://storage.googleapis.com/store-backend/product/test-33-0bab331b-836b-4815-a61e-6a620ea8febf.png', NULL, 1, 'hand-closed.png', 14979, 'png', NULL, '2021-06-17 15:36:16', '2021-06-17 15:36:16'),
(6, 48, 'https://storage.googleapis.com/store-backend/product/test-33-cc3aa6b4-5f11-4ba0-846b-2d465a735a7c.png', NULL, 1, 'hand-closed.png', 14979, 'png', NULL, '2021-06-18 03:38:12', '2021-06-18 03:38:12'),
(9, 63, 'https://storage.googleapis.com/store-backend/product/test-63-edited-ab08be7f-930d-43cc-8eec-bc5ae67059c8.png', NULL, 1, 'Screenshot from 2021-06-21 03-29-59.png', 160775, 'png', NULL, '2021-06-21 06:11:10', '2021-06-21 06:14:41'),
(12, 63, 'https://storage.googleapis.com/store-backend/product/test-63-edited-7764a7c9-0c1a-4e4d-a392-4041b7c67b01.png', NULL, 1, 'test-63-edited-7764a7c9-0c1a-4e4d-a392-4041b7c67b01.png', 160775, 'png', NULL, '2021-06-21 06:50:08', '2021-06-21 06:50:08'),
(13, 63, 'https://storage.googleapis.com/store-backend/product/test-63-edited-96a150d2-d099-4e4b-891a-75e82b5a71f5.png', NULL, 1, 'test-63-edited-96a150d2-d099-4e4b-891a-75e82b5a71f5.png', 160775, 'png', NULL, '2021-06-21 06:50:37', '2021-06-24 13:37:36'),
(14, 63, 'https://storage.googleapis.com/store-backend/product/test-63-edited-83130e2d-1e1c-4b6d-a86f-06c8660c18d9.png', NULL, 1, 'test-63-edited-83130e2d-1e1c-4b6d-a86f-06c8660c18d9.png', 160775, 'png', NULL, '2021-06-21 06:53:58', '2021-06-21 06:53:58'),
(16, 63, 'https://storage.googleapis.com/store-backend/product/test-63-edited-d66a7f54-f32c-470b-8521-db610c1c62cb.png', NULL, 1, 'test-63-edited-d66a7f54-f32c-470b-8521-db610c1c62cb.png', 160775, 'png', NULL, '2021-06-21 06:55:06', '2021-06-21 06:55:06'),
(17, 63, 'https://storage.googleapis.com/store-backend/product/test-63-edited-d0b43b65-5b09-46d5-a09e-7212499969a8.png', NULL, 1, 'test-63-edited-d0b43b65-5b09-46d5-a09e-7212499969a8.png', 160775, 'png', NULL, '2021-06-21 13:57:45', '2021-06-21 13:57:45'),
(18, 63, 'https://storage.googleapis.com/store-backend/product/test-63-edited-23bb9aad-bc96-4af3-88db-204ccd38e0bd.png', NULL, 1, 'test-63-edited-23bb9aad-bc96-4af3-88db-204ccd38e0bd.png', 160775, 'png', NULL, '2021-06-24 13:29:45', '2021-06-24 13:29:45'),
(19, 93, 'https://storage.googleapis.com/store-backend/product/prod-frank-53dce68f-aeb2-4751-81ed-d305f2de3806.jpg', NULL, 1, 'prod-frank-53dce68f-aeb2-4751-81ed-d305f2de3806.jpg', 17516, 'jpeg', NULL, '2021-06-24 14:10:21', '2021-06-24 14:10:21'),
(20, 94, 'https://storage.googleapis.com/store-backend/product/prod-frank-51febfb7-e9e3-4898-8fae-e99c1d8a15ac.jpg', NULL, 1, 'prod-frank-51febfb7-e9e3-4898-8fae-e99c1d8a15ac.jpg', 17516, 'jpeg', NULL, '2021-06-24 14:12:50', '2021-06-24 14:12:50'),
(21, 93, 'https://storage.googleapis.com/store-backend/product/prodfrank-edited-f587c7ff-b153-4f7a-9eda-b06fe0e00d95.png', NULL, 1, 'prodfrank-edited-f587c7ff-b153-4f7a-9eda-b06fe0e00d95.png', 160775, 'png', NULL, '2021-06-24 14:13:42', '2021-06-24 14:13:42'),
(22, 96, 'https://storage.googleapis.com/store-backend/product/prod-frank-84228e22-36b6-47bf-9b79-1960305fdef7.jpg', NULL, 1, 'prod-frank-84228e22-36b6-47bf-9b79-1960305fdef7.jpg', 17516, 'jpeg', NULL, '2021-06-24 17:52:58', '2021-06-24 17:52:58'),
(23, 99, 'https://storage.googleapis.com/store-backend/product/test-33-297a9bae-c34c-4b24-8c05-2f234745b73d.png', NULL, 1, 'test-33-297a9bae-c34c-4b24-8c05-2f234745b73d.png', 11847, 'png', NULL, '2021-06-24 17:55:12', '2021-06-24 17:55:12'),
(24, 100, 'https://storage.googleapis.com/store-backend/product/prod-frank-38d05302-d2a7-49e5-9178-a4d261873da2.jpg', NULL, 1, 'prod-frank-38d05302-d2a7-49e5-9178-a4d261873da2.jpg', 17516, 'jpeg', NULL, '2021-06-24 21:27:48', '2021-06-24 21:27:48'),
(25, 101, 'https://storage.googleapis.com/store-backend/product/prod-frank-dd88b3f6-b382-49ae-ac58-2bf411ecf957.jpg', NULL, 1, 'prod-frank-dd88b3f6-b382-49ae-ac58-2bf411ecf957.jpg', 17516, 'jpeg', NULL, '2021-06-24 21:30:32', '2021-06-24 21:30:32'),
(26, 102, 'https://storage.googleapis.com/store-backend/product/prod-frank-bd7b2918-4b2c-41bd-a401-71689895fcbb.jpg', NULL, 1, 'prod-frank-bd7b2918-4b2c-41bd-a401-71689895fcbb.jpg', 17516, 'jpeg', NULL, '2021-06-24 21:31:10', '2021-06-24 21:31:10'),
(27, 105, 'https://storage.googleapis.com/store-backend/product/prod-frank-b8545018-0149-4af4-9a05-c7950f25c777.jpg', NULL, 1, 'prod-frank-b8545018-0149-4af4-9a05-c7950f25c777.jpg', 17516, 'jpeg', NULL, '2021-06-24 21:35:30', '2021-06-24 21:35:30'),
(28, 107, 'https://storage.googleapis.com/store-backend/product/prod-frank-396932b7-1c95-424c-854e-fdd0988a5b8b.jpg', NULL, 1, 'prod-frank-396932b7-1c95-424c-854e-fdd0988a5b8b.jpg', 17516, 'jpeg', NULL, '2021-06-24 21:38:36', '2021-06-24 21:38:36'),
(29, 107, 'https://storage.googleapis.com/store-backend/product/prod-frank-f70d72be-607a-4971-ac6b-1ecee9054423.png', NULL, 1, 'prod-frank-f70d72be-607a-4971-ac6b-1ecee9054423.png', 68731, 'png', NULL, '2021-06-24 21:38:36', '2021-06-24 21:38:36'),
(30, 107, 'https://storage.googleapis.com/store-backend/product/prod-frank-990deeff-b07a-4486-b836-cc5a50ebaa5a.png', NULL, 1, 'prod-frank-990deeff-b07a-4486-b836-cc5a50ebaa5a.png', 132330, 'png', NULL, '2021-06-24 21:38:37', '2021-06-24 21:38:37'),
(31, 108, 'https://storage.googleapis.com/store-backend/product/prod-frank-c9f6d8e4-a3fc-4b0a-8a38-917d985243f6.jpg', NULL, 1, 'prod-frank-c9f6d8e4-a3fc-4b0a-8a38-917d985243f6.jpg', 17516, 'jpeg', NULL, '2021-06-24 21:39:20', '2021-06-24 21:39:20'),
(32, 108, 'https://storage.googleapis.com/store-backend/product/prod-frank-9d54e7b5-dbb0-443c-8bf2-3dae4d7f4173.png', NULL, 1, 'prod-frank-9d54e7b5-dbb0-443c-8bf2-3dae4d7f4173.png', 68731, 'png', NULL, '2021-06-24 21:39:20', '2021-06-24 21:39:20'),
(33, 108, 'https://storage.googleapis.com/store-backend/product/prod-frank-97ab711e-1e0d-4bca-8525-b2e0c40f06fc.png', NULL, 1, 'prod-frank-97ab711e-1e0d-4bca-8525-b2e0c40f06fc.png', 132330, 'png', NULL, '2021-06-24 21:39:20', '2021-06-24 21:39:20'),
(34, 108, 'https://storage.googleapis.com/store-backend/product/prod-frank-95f39303-f42a-4b31-bd69-cd265adfec17.png', NULL, 1, 'prod-frank-95f39303-f42a-4b31-bd69-cd265adfec17.png', 6828, 'png', NULL, '2021-06-24 21:47:37', '2021-06-24 21:47:37'),
(35, 108, 'https://storage.googleapis.com/store-backend/product/prod-frank-d2abe83d-0516-43fb-a3c1-66f500af3f6b.png', NULL, 1, 'prod-frank-d2abe83d-0516-43fb-a3c1-66f500af3f6b.png', 5933, 'png', NULL, '2021-06-24 21:47:38', '2021-06-24 21:47:38'),
(36, 117, 'https://storage.googleapis.com/store-backend/product/test-33-d1fe38ff-7afb-485c-bc15-0eb663c3fc55.png', NULL, 1, 'test-33-d1fe38ff-7afb-485c-bc15-0eb663c3fc55.png', 365873, 'png', NULL, '2021-06-28 13:10:56', '2021-06-28 13:10:56'),
(37, 117, 'https://storage.googleapis.com/store-backend/product/test-33-586d83cf-2da9-4d32-a808-a2c845387969.png', NULL, 1, 'test-33-586d83cf-2da9-4d32-a808-a2c845387969.png', 269067, 'png', NULL, '2021-06-28 13:10:56', '2021-06-28 13:10:56'),
(38, 120, 'https://storage.googleapis.com/store-backend/product/prod-frank-b3b7e808-6d3e-421d-9d31-4ca1fb9cb074.png', NULL, 1, 'prod-frank-b3b7e808-6d3e-421d-9d31-4ca1fb9cb074.png', 11847, 'png', NULL, '2021-06-28 15:21:16', '2021-06-28 15:21:16'),
(39, 120, 'https://storage.googleapis.com/store-backend/product/prod-frank-cc9e0f3f-c30e-4e17-9e48-6a2c646a9d41.jpeg', NULL, 1, 'prod-frank-cc9e0f3f-c30e-4e17-9e48-6a2c646a9d41.jpeg', 4304, 'jpeg', NULL, '2021-06-28 15:21:16', '2021-06-28 15:21:16'),
(40, 39, 'https://storage.googleapis.com/store-backend/product/test-63-edited-c05aad7b-b9f4-4ccc-9499-b3e8b1d55f3a.png', NULL, 1, 'test-63-edited-c05aad7b-b9f4-4ccc-9499-b3e8b1d55f3a.png', 365873, 'png', NULL, '2021-06-28 15:35:36', '2021-06-28 15:35:36'),
(41, 39, 'https://storage.googleapis.com/store-backend/product/test-63-edited-60fa59ba-a357-475a-9395-32feb9769526.png', NULL, 1, 'test-63-edited-60fa59ba-a357-475a-9395-32feb9769526.png', 269067, 'png', NULL, '2021-06-28 15:35:36', '2021-06-28 15:35:36'),
(42, 38, 'https://storage.googleapis.com/store-backend/product/test-33-6c8b8deb-44b0-47dc-9172-74ff452483a3.png', NULL, 1, 'test-33-6c8b8deb-44b0-47dc-9172-74ff452483a3.png', 63532, 'png', NULL, '2021-06-28 16:28:49', '2021-06-28 16:28:49'),
(43, 38, 'https://storage.googleapis.com/store-backend/product/test-33-0b3033bc-486e-4463-abb2-c8b84fdad2c3.png', NULL, 1, 'test-33-0b3033bc-486e-4463-abb2-c8b84fdad2c3.png', 97609, 'png', NULL, '2021-06-28 16:28:49', '2021-06-28 16:28:49'),
(44, 40, 'https://storage.googleapis.com/store-backend/product/test-33-dc8bf9fa-f487-4cc1-aa45-3f3121805bba.png', NULL, 1, 'test-33-dc8bf9fa-f487-4cc1-aa45-3f3121805bba.png', 178368, 'png', NULL, '2021-06-28 16:29:28', '2021-06-28 16:29:28'),
(45, 40, 'https://storage.googleapis.com/store-backend/product/test-33-f268419a-aa45-4082-99c3-ee2e21eb2eb1.png', NULL, 1, 'test-33-f268419a-aa45-4082-99c3-ee2e21eb2eb1.png', 217413, 'png', NULL, '2021-06-28 16:29:28', '2021-06-28 16:29:28'),
(46, 128, 'https://storage.googleapis.com/store-backend/product/prod-frank-abe72ea2-1ab1-40d6-8f31-00f057ce302c.jpg', NULL, 1, 'prod-frank-abe72ea2-1ab1-40d6-8f31-00f057ce302c.jpg', 17516, 'jpeg', NULL, '2021-06-28 18:05:27', '2021-06-28 18:05:27'),
(47, 128, 'https://storage.googleapis.com/store-backend/product/prod-frank-efb97fc2-46f1-42bc-9ac8-b7301c7043b6.png', NULL, 1, 'prod-frank-efb97fc2-46f1-42bc-9ac8-b7301c7043b6.png', 68731, 'png', NULL, '2021-06-28 18:05:28', '2021-06-28 18:05:28'),
(54, 124, 'https://storage.googleapis.com/store-backend/product/product-124--438d055e-be0b-4b95-8a47-b3be49f66162.png', NULL, 1, 'product-124--438d055e-be0b-4b95-8a47-b3be49f66162.png', 29171, 'png', NULL, '2021-06-29 12:12:47', '2021-06-29 12:12:47'),
(55, 124, 'https://storage.googleapis.com/store-backend/product/product-124--dffe12f5-0424-4615-8f7a-12bff7e4851e.png', NULL, 1, 'product-124--dffe12f5-0424-4615-8f7a-12bff7e4851e.png', 21895, 'png', NULL, '2021-06-29 12:12:47', '2021-06-29 12:12:47'),
(56, 124, 'https://storage.googleapis.com/store-backend/product/product-124--06d560da-d748-47b4-b0bb-990276102f1c.png', NULL, 1, 'product-124--06d560da-d748-47b4-b0bb-990276102f1c.png', 57281, 'png', NULL, '2021-06-29 12:12:47', '2021-06-29 12:12:47'),
(57, 124, 'https://storage.googleapis.com/store-backend/product/product-124--7e7592a9-ed45-4742-861b-2c91a26c36b4.png', NULL, 1, 'product-124--7e7592a9-ed45-4742-861b-2c91a26c36b4.png', 31394, 'png', NULL, '2021-06-29 12:12:47', '2021-06-29 12:12:47'),
(58, 124, 'https://storage.googleapis.com/store-backend/product/product-124--bf55ac9f-dd74-436a-8f32-3cf979c80cfb.png', NULL, 1, 'product-124--bf55ac9f-dd74-436a-8f32-3cf979c80cfb.png', 33657, 'png', NULL, '2021-06-29 12:12:47', '2021-06-29 12:12:47'),
(59, 124, 'https://storage.googleapis.com/store-backend/product/product-124--f89460e6-de80-4cc1-97e2-d31da35602a7.png', NULL, 1, 'product-124--f89460e6-de80-4cc1-97e2-d31da35602a7.png', 34677, 'png', NULL, '2021-06-29 12:12:47', '2021-06-29 12:12:47'),
(60, 123, 'https://storage.googleapis.com/store-backend/product/prod-frank-25be74a2-7093-40af-8cf0-333e31108c67.png', NULL, 1, 'prod-frank-25be74a2-7093-40af-8cf0-333e31108c67.png', 29171, 'png', NULL, '2021-06-29 12:39:44', '2021-06-29 12:39:44'),
(61, 123, 'https://storage.googleapis.com/store-backend/product/prod-frank-cb4c83a8-100f-4b9b-b8f7-b6c5caf1486b.png', NULL, 1, 'prod-frank-cb4c83a8-100f-4b9b-b8f7-b6c5caf1486b.png', 21895, 'png', NULL, '2021-06-29 12:39:44', '2021-06-29 12:39:44'),
(62, 123, 'https://storage.googleapis.com/store-backend/product/prod-frank-e91e15d3-95e7-4d4d-92b8-cc8818965131.png', NULL, 1, 'prod-frank-e91e15d3-95e7-4d4d-92b8-cc8818965131.png', 57281, 'png', NULL, '2021-06-29 12:39:44', '2021-06-29 12:39:44'),
(63, 123, 'https://storage.googleapis.com/store-backend/product/prod-frank-fc0fd0a8-b5ce-497e-8dab-a868099cdceb.png', NULL, 1, 'prod-frank-fc0fd0a8-b5ce-497e-8dab-a868099cdceb.png', 31394, 'png', NULL, '2021-06-29 12:39:44', '2021-06-29 12:39:44'),
(64, 123, 'https://storage.googleapis.com/store-backend/product/prod-frank-0d746bd7-862e-4747-b84d-654a38a6dc1d.png', NULL, 1, 'prod-frank-0d746bd7-862e-4747-b84d-654a38a6dc1d.png', 33657, 'png', NULL, '2021-06-29 12:39:44', '2021-06-29 12:39:44'),
(65, 123, 'https://storage.googleapis.com/store-backend/product/prod-frank-50d1c4e7-808f-417a-a92f-9ec5a48e6666.png', NULL, 1, 'prod-frank-50d1c4e7-808f-417a-a92f-9ec5a48e6666.png', 34677, 'png', NULL, '2021-06-29 12:39:44', '2021-06-29 12:39:44'),
(66, 63, 'https://storage.googleapis.com/store-backend/product/prodfrank-edited-eef5e518-ac0a-4985-94cf-32d152c1fe69.png', NULL, 1, 'prodfrank-edited-eef5e518-ac0a-4985-94cf-32d152c1fe69.png', 55484, 'png', NULL, '2021-06-29 12:49:09', '2021-06-29 12:51:59'),
(67, 123, 'https://storage.googleapis.com/store-backend/product/pro-123-e9811a29-8695-475f-af33-d8ecbcd3be91.png', NULL, 1, 'pro-123-e9811a29-8695-475f-af33-d8ecbcd3be91.png', 34677, 'png', NULL, '2021-06-29 13:03:38', '2021-06-29 13:03:38'),
(68, 123, 'https://storage.googleapis.com/store-backend/product/pro-123-1d2e19da-abab-4ecf-b22b-58939ee94a4b.png', NULL, 1, 'pro-123-1d2e19da-abab-4ecf-b22b-58939ee94a4b.png', 29171, 'png', NULL, '2021-06-29 13:09:04', '2021-06-29 13:09:04'),
(69, 123, 'https://storage.googleapis.com/store-backend/product/pro-123-60396485-2d6c-4a67-a6c7-fb61323b327b.png', NULL, 1, 'pro-123-60396485-2d6c-4a67-a6c7-fb61323b327b.png', 21895, 'png', NULL, '2021-06-29 13:09:04', '2021-06-29 13:09:04'),
(70, 123, 'https://storage.googleapis.com/store-backend/product/pro-123-497f0211-6306-4493-b751-2b97203d4898.png', NULL, 1, 'pro-123-497f0211-6306-4493-b751-2b97203d4898.png', 57281, 'png', NULL, '2021-06-29 13:09:05', '2021-06-29 13:09:05'),
(71, 123, 'https://storage.googleapis.com/store-backend/product/pro-123-7717fb73-113d-46b9-9790-9911afce73b2.png', NULL, 1, 'pro-123-7717fb73-113d-46b9-9790-9911afce73b2.png', 31394, 'png', NULL, '2021-06-29 13:09:05', '2021-06-29 13:09:05'),
(72, 123, 'https://storage.googleapis.com/store-backend/product/pro-123-60498ade-4366-4856-955d-f4b050e5237a.png', NULL, 1, 'pro-123-60498ade-4366-4856-955d-f4b050e5237a.png', 33657, 'png', NULL, '2021-06-29 13:09:05', '2021-06-29 13:09:05'),
(73, 123, 'https://storage.googleapis.com/store-backend/product/pro-123-ba9cb591-d9cb-404c-947b-fffe77ac70fa.png', NULL, 1, 'pro-123-ba9cb591-d9cb-404c-947b-fffe77ac70fa.png', 34677, 'png', NULL, '2021-06-29 13:09:05', '2021-06-29 13:09:05'),
(74, 122, 'https://storage.googleapis.com/store-backend/product/pro-122-0555d066-bf4e-4435-b705-538a4ebcf1d1.png', NULL, 1, 'pro-122-0555d066-bf4e-4435-b705-538a4ebcf1d1.png', 57281, 'octet-stream', NULL, '2021-06-29 16:34:33', '2021-06-29 16:34:33'),
(77, 122, 'https://storage.googleapis.com/store-backend/product/pro-122-844b8977-6148-4192-92aa-04c32d710d48.png', NULL, 1, 'pro-122-844b8977-6148-4192-92aa-04c32d710d48.png', 33657, 'octet-stream', NULL, '2021-06-29 17:04:45', '2021-06-29 17:04:45'),
(78, 122, 'https://storage.googleapis.com/store-backend/product/pro-122-b10669f8-e452-4b7e-bc5a-8c90400e643b.png', NULL, 1, 'pro-122-b10669f8-e452-4b7e-bc5a-8c90400e643b.png', 31394, 'octet-stream', NULL, '2021-06-29 17:04:50', '2021-06-29 17:04:50'),
(79, 129, 'https://storage.googleapis.com/store-backend/product/spider-man-suite-a1f5e792-b496-4718-a4bf-0521b399a9a7.png', NULL, 1, 'spider-man-suite-a1f5e792-b496-4718-a4bf-0521b399a9a7.png', 97609, 'octet-stream', NULL, '2021-06-29 23:00:48', '2021-06-29 23:00:48'),
(80, 129, 'https://storage.googleapis.com/store-backend/product/spider-man-suite-6b3362ee-0a97-4892-9f0e-14200a9cf1a8.png', NULL, 1, 'spider-man-suite-6b3362ee-0a97-4892-9f0e-14200a9cf1a8.png', 63532, 'octet-stream', NULL, '2021-06-29 23:00:48', '2021-06-29 23:00:48'),
(83, 129, 'https://storage.googleapis.com/store-backend/product/spider-man-suite1-eea07b8e-dbd6-4ec7-b7e7-e07bc5ac48a6.png', NULL, 1, 'spider-man-suite1-eea07b8e-dbd6-4ec7-b7e7-e07bc5ac48a6.png', 178368, 'octet-stream', NULL, '2021-06-29 23:41:52', '2021-06-29 23:41:52'),
(85, 130, 'https://storage.googleapis.com/store-backend/product/testing-11301f6a-b343-4660-bce0-ce1330a63634.png', NULL, 1, 'testing-11301f6a-b343-4660-bce0-ce1330a63634.png', 12488, 'octet-stream', NULL, '2021-06-30 15:07:46', '2021-06-30 15:07:46'),
(86, 130, 'https://storage.googleapis.com/store-backend/product/testing-8d024387-9529-421a-8542-f9098965911d.png', NULL, 1, 'testing-8d024387-9529-421a-8542-f9098965911d.png', 6138, 'octet-stream', NULL, '2021-06-30 15:07:46', '2021-06-30 15:07:46'),
(87, 131, 'https://storage.googleapis.com/store-backend/product/mouse-apple-6fd5353e-ff1c-4847-914b-d6299bd9dde3.png', NULL, 1, 'mouse-apple-6fd5353e-ff1c-4847-914b-d6299bd9dde3.png', 27596, 'octet-stream', NULL, '2021-06-30 18:05:08', '2021-06-30 18:05:08'),
(88, 131, 'https://storage.googleapis.com/store-backend/product/mouse-apple-9a5a2ec3-2b16-4fcf-bcb8-614ca6c4c324.png', NULL, 1, 'mouse-apple-9a5a2ec3-2b16-4fcf-bcb8-614ca6c4c324.png', 70199, 'octet-stream', NULL, '2021-06-30 18:05:08', '2021-06-30 18:05:08');

--
-- Dumping data for table `product_brands`
--

INSERT INTO `product_brands` (`id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Coke', 'A product or cocacola', 1, '2021-06-18 02:24:21', '2021-07-01 09:39:16'),
(2, 'Intel', 'a product of Intel', 1, '2021-06-28 21:04:50', '2021-06-28 21:04:50'),
(3, 'Apple', 'a product of Apple', 1, '2021-06-28 21:05:04', '2021-06-28 21:05:04'),
(4, 'Pepsi', 'PepsiCo', 1, '2021-06-30 15:44:13', '2021-06-30 15:52:43');

--
-- Dumping data for table `product_categories`
--

INSERT INTO `product_categories` (`id`, `merchant_id`, `name`, `description`, `fee`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'test edited', 'desc again edited by mughees', 5, 1, '2021-06-16 01:06:19', '2021-07-01 11:20:54'),
(2, 1, 'Category2', 'Category2 Des', 3, 1, '2021-06-16 01:06:30', '2021-06-16 01:06:30'),
(3, 1, 'Category3', 'Category2 Des', 10, 0, '2021-06-16 01:06:38', '2021-06-18 11:21:20'),
(4, 1, 'test', 'test prod category', 10, 1, '2021-06-18 02:11:18', '2021-06-18 02:11:18'),
(6, 1, 'Cat 1', 'cat 1', 5, 0, '2021-06-19 11:00:46', '2021-06-19 11:07:00'),
(7, 1, 'Cat 2', 'cat 2 des', 6, 0, '2021-06-19 11:00:56', '2021-06-19 11:06:57'),
(8, 1, 'Cat 3', 'cat 3 des', 6, 0, '2021-06-19 11:01:02', '2021-06-19 11:06:54'),
(9, 1, 'Cat 4', 'cat 4 des', 6, 0, '2021-06-19 11:01:10', '2021-06-19 11:06:50'),
(10, 1, 'Cat 10', 'cat 4 des', 6, 1, '2021-06-19 11:31:36', '2021-06-19 11:31:36'),
(11, 1, 'Cat 11', 'cat 4 des', 6, 1, '2021-06-19 11:31:39', '2021-06-19 11:31:39'),
(12, 1, 'Cat 12', 'cat 4 des', 6, 1, '2021-06-19 11:31:42', '2021-06-19 11:31:42'),
(13, 1, 'Cat 13', 'cat 4 des', 6, 1, '2021-06-19 11:31:44', '2021-06-19 11:31:44'),
(14, 1, 'Cat 14', 'cat 4 des', 6, 1, '2021-06-19 11:31:47', '2021-06-19 11:31:47'),
(15, 1, 'Cat 141', 'cat 4 des', 6, 1, '2021-06-19 12:57:11', '2021-06-19 12:57:11'),
(17, 1, 'Fashion', 'Fash desc', 10, 1, '2021-07-01 11:18:31', '2021-07-01 11:26:59');

--
-- Dumping data for table `product_deliveries`
--

INSERT INTO `product_deliveries` (`id`, `name`, `description`, `fee`, `status`, `created_at`, `updated_at`) VALUES
(2, 'JTExpress', 'desc deli 1', 2, 1, '2021-06-17 13:10:36', '2021-06-29 18:30:16'),
(3, 'Lazada', 'desc deli 1', 2, 1, '2021-06-18 11:21:10', '2021-06-29 18:30:23'),
(4, 'Shopee', 'desc deli 1', 2, 1, '2021-06-19 14:34:04', '2021-06-29 18:30:30');

--
-- Dumping data for table `product_likes`
--

INSERT INTO `product_likes` (`id`, `product_id`, `user_id`, `created_at`, `updated_at`) VALUES
(7, 38, 4, '2021-06-20 17:18:41', '2021-06-20 17:18:41'),
(8, 71, 4, '2021-06-20 17:49:21', '2021-06-20 17:49:21'),
(27, 63, 1, '2021-06-22 16:41:29', '2021-06-22 16:41:29'),
(47, 40, 16, '2021-06-25 17:59:48', '2021-06-25 17:59:48'),
(50, 39, 16, '2021-06-25 18:01:05', '2021-06-25 18:01:05'),
(76, 68, 4, '2021-06-28 00:41:55', '2021-06-28 00:41:55'),
(79, 40, 20, '2021-06-29 13:39:38', '2021-06-29 13:39:38'),
(82, 122, 1, '2021-06-29 19:10:17', '2021-06-29 19:10:17'),
(85, 38, 1, '2021-06-30 12:13:32', '2021-06-30 12:13:32'),
(87, 40, 1, '2021-06-30 23:22:22', '2021-06-30 23:22:22'),
(88, 129, 1, '2021-06-30 23:51:35', '2021-06-30 23:51:35'),
(89, 131, 1, '2021-06-30 23:51:41', '2021-06-30 23:51:41'),
(90, 130, 1, '2021-06-30 23:51:46', '2021-06-30 23:51:46'),
(91, 117, 1, '2021-06-30 23:51:56', '2021-06-30 23:51:56'),
(92, 120, 1, '2021-06-30 23:52:14', '2021-06-30 23:52:14'),
(93, 107, 1, '2021-06-30 23:52:23', '2021-06-30 23:52:23'),
(94, 105, 1, '2021-06-30 23:52:32', '2021-06-30 23:52:32'),
(99, 40, 28, '2021-07-01 10:43:56', '2021-07-01 10:43:56');

--
-- Dumping data for table `push_notifications`
--

INSERT INTO `push_notifications` (`id`, `user_id`, `order_updates`, `chats`, `promotions`, `status`, `created_at`, `updated_at`) VALUES
(2, 15, 1, 1, 1, 1, '2021-06-22 02:35:28', '2021-06-23 13:24:21'),
(3, 20, 0, 0, 0, 1, '2021-06-29 13:35:36', '2021-06-29 13:35:36'),
(4, 27, 0, 0, 0, 1, '2021-07-01 10:17:07', '2021-07-01 10:17:07'),
(5, 28, 0, 0, 0, 1, '2021-07-01 10:43:14', '2021-07-01 10:43:14'),
(6, 29, 0, 0, 0, 1, '2021-07-01 11:46:28', '2021-07-01 11:46:28');

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `status`) VALUES
(1, 'superadmin', 1),
(2, 'member', 1),
(3, 'merchant', 1);

--
-- Dumping data for table `spinwheel_settings`
--

INSERT INTO `spinwheel_settings` (`id`, `name`, `description`, `prize_id`, `num_spin`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'option 1', 'spin option 1', 1, 1, '2021-06-29 02:11:21', '2021-06-29 02:11:21', 1, '2021-06-29 02:12:16', '2021-06-29 05:32:17'),
(2, 'option 2', 'spin option 2', 2, 1, '2021-06-29 02:11:21', '2021-06-29 02:11:21', 1, '2021-06-29 02:12:16', '2021-06-29 05:32:20'),
(3, 'option 3', 'spin option 3', 3, 1, '2021-06-29 02:11:21', '2021-06-29 02:11:21', 1, '2021-06-29 02:12:16', '2021-06-29 05:32:22'),
(4, 'option 4', 'spin option 4', 4, 1, '2021-06-29 02:11:21', '2021-06-29 02:11:21', 1, '2021-06-29 02:12:16', '2021-06-29 05:32:24'),
(5, 'option 5', 'spin option 5', 5, 1, '2021-06-29 02:11:21', '2021-06-29 02:11:21', 1, '2021-06-29 02:12:16', '2021-06-29 05:32:26'),
(6, 'option 6', 'spin option 6', 6, 1, '2021-06-29 02:11:21', '2021-06-29 02:11:21', 1, '2021-06-29 02:12:16', '2021-06-29 05:32:29'),
(7, 'option 7', 'spin option 7', 7, 1, '2021-06-29 02:11:21', '2021-06-29 02:11:21', 1, '2021-06-29 02:12:16', '2021-06-29 05:32:32'),
(8, 'option 8', 'spin option 8', 8, 1, '2021-06-29 02:11:21', '2021-06-29 02:11:21', 1, '2021-06-29 02:12:16', '2021-06-29 05:32:34'),
(9, 'option 9', 'spin option 9', 9, 1, '2021-06-29 02:11:21', '2021-06-29 02:11:21', 1, '2021-06-29 02:12:16', '2021-06-29 05:32:37'),
(10, 'option 10', 'spin option 10', 10, 1, '2021-06-29 02:11:21', '2021-06-29 02:11:21', 1, '2021-06-29 02:12:16', '2021-06-29 05:32:39');

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `role_id`, `name`, `email`, `password`, `avatar_url`, `contact_no`, `salutation`, `birth_date`, `gender`, `points`, `status`, `is_store_user`, `reset_code`, `created_at`, `updated_at`) VALUES
(1, 1, 'SuperAdmin', 'ios@yopmail.com', '$2y$08$StD2XWRk1CyszAcDwQtgG.vz9Ub6Oi8qruNyv.vMhGcCmkSHfOnAS', 'https://storage.googleapis.com/store-backend/avatar/superadmin-2025a502-3ac1-47c3-973a-840c02cd648f', '0987278522', NULL, '2018-06-28 00:00:00', 'female', 0, 1, 0, NULL, '2021-06-16 00:03:20', '2021-06-29 16:51:02'),
(4, 1, 'fred carz', 'franklincaruana@gmail.com', '$2y$12$ktOqbeFDk2Y2tPw.xhheyOlbpgjBL50MIswHmg0QrcZGZsikNsB.6', 'https://ui-avatars.com/api/?name=IOS&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, '282559', '2021-06-16 00:03:20', '2021-06-27 22:16:10'),
(5, 2, 'test', 'ios1@yopmail.com', '$2y$08$tdqkjK.kVMh9UeK1Js5lTejOLZ/htAgxW1rO5l9P1qAX2RB.HTSG6', 'https://storage.googleapis.com/store-backend/avatar/test-15c61e06-275b-43ed-94c4-3421b821e54a.jpeg', '+65999888777', NULL, NULL, 'male', 0, 1, 0, NULL, '2021-06-16 01:17:58', '2021-06-24 12:50:11'),
(6, 3, 'Miqdad Farchas', 'miqdad.farcha@lmao.com', '$2y$08$8zno/cdl1ZVgaEezdGtnUOE838GyzSyjq8CE4jLpA8DLa9kJ7nqA2', 'https://ui-avatars.com/api/?name=Miqdad%20Farchas&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-06-16 02:10:55', '2021-06-16 02:10:55'),
(7, 2, 'andy', 'andy@yopmail.com', '$2y$08$VrH/tUu63jsrgxkWEY5odOvBJaHLQinkAkkq4ogkuVM6FhbqxLlXK', 'https://ui-avatars.com/api/?name=andy&color=7F9CF5&background=EBF4FF', '0896639922', NULL, NULL, 'male', 0, 1, 0, NULL, '2021-06-16 05:56:30', '2021-06-16 13:19:52'),
(8, 2, 'Tester', 'test1@yopmail.com', '$2y$08$v6B9fwfSmkHJNrSaJ5BQ1uBlGQqUYC2edMCr/g2pZ8/mzriB117Sa', 'https://ui-avatars.com/api/?name=test&color=7F9CF5&background=EBF4FF', '0909888666', NULL, NULL, 'male', 0, 1, 0, NULL, '2021-06-16 08:01:52', '2021-06-16 17:58:48'),
(9, 2, 'tan', 'tan@yopmail.com', '$2y$08$GWWoCnsqdQluyWLahkQBveseUjZH2fTAZXfhGzWWE.N4AYbk9Kire', 'https://ui-avatars.com/api/?name=tan&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-06-16 09:54:37', '2021-06-16 09:54:37'),
(10, 2, 'tin', 'tin@yopmail.com', '$2y$08$srySmeUOPIvw0qRCZ0xsPeCv1nTeMD7DkTlkU/d1sFRI6WyDbUbr6', 'https://ui-avatars.com/api/?name=tin&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-06-16 13:07:36', '2021-06-16 13:07:36'),
(11, 2, 'tan', 'test2@yopmail.com', '$2y$08$qNwiFAtyAaMMwlvmW.4EB.rca80.kWu5n91EgVmIMpkbT4/1QU.IC', 'https://ui-avatars.com/api/?name=tan&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-06-16 13:17:55', '2021-06-16 13:17:55'),
(12, 2, 'dai', 'dai@gmail.com', '$2y$08$qAnkGebV5Sx/McpSYmKdROSpzbmh/roykT45cwK1UGLD4bR0Ahn1K', 'https://ui-avatars.com/api/?name=dai&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-06-18 06:43:19', '2021-06-18 06:43:19'),
(13, 3, 'Boy', 'iosc@yopmail.com', '$2y$08$73Ox6Avet5lzmt7u5chkoeU4NUyllAdiDH5GPrwvhQHc3eEL/IAnS', 'https://storage.googleapis.com/store-backend/avatar/boy-479d57fc-4c68-4d8f-a3de-70639b3a1c56.jpeg', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-06-18 14:52:29', '2021-06-18 15:09:37'),
(14, 2, 'test', 'test@gmail.com', '$2y$08$QQwCoNy0oZJUuGUBnqdVsOZiBZtEEHxjpW99SHrgl69EERhxoKoX2', 'https://ui-avatars.com/api/?name=test&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-06-18 15:44:26', '2021-06-18 15:44:26'),
(15, 2, 'firman', 'fsyah7052@gmail.com', '$2y$08$eOZA/x8EZW5q1aGPpDPguO9N9p1d5GkoVaU0Besw0HeWgDiKrDdUC', 'https://ui-avatars.com/api/?name=firman&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-06-21 23:52:24', '2021-06-21 23:52:24'),
(16, 2, 'iiii', 'ios5@yopmail.com', '$2y$08$JIpHWQVZS2fZZJrjjp5CG.jOjcByHwuex3wzE8nsdlXZgVxZVaLUK', 'https://ui-avatars.com/api/?name=iiii&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-06-22 11:11:50', '2021-06-22 11:11:50'),
(17, 1, 'Terry', 'terry.li@store.tech', '$2y$10$J00nXHo6kOjWYMUNjgOeRupm9dEOLBa79kUo6d9.ILLRsUZOmfOR2', 'https://ui-avatars.com/api/?name=Terry&color=7F9CF5&background=EBF4FF', NULL, NULL, '2021-06-22 06:30:29', NULL, 0, 1, 0, NULL, '2021-06-22 06:30:29', '2021-06-22 06:30:29'),
(18, 2, 'Dai', 'dai@yopmail.com', '$2y$08$3I1zJ5qyrJlpRn0F4wsxSeKsf66Gg7KBiARjlHvo5T08AIkZOuF96', 'https://ui-avatars.com/api/?name=Dai&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-06-24 11:39:02', '2021-06-24 11:39:02'),
(19, 2, 'test', 'test@yopmail.com', '$2y$08$hOVO3f0P/6X07N3z2uauReeVRvKJWntwB9IMph/J/ReY8xUbj3ImO', 'https://ui-avatars.com/api/?name=test&color=7F9CF5&background=EBF4FF', '0909112233', NULL, '2019-04-24 08:00:00', 'male', 0, 1, 0, NULL, '2021-06-25 22:04:30', '2021-06-27 05:20:45'),
(20, 2, 'Danhios', 'dodanh897@gmail.com', '$2y$08$X9/404sO2bXejQ1pi0BfluT.KHJ.zXEvWlhgNrFS/k6WALfzHU3Q.', 'https://ui-avatars.com/api/?name=Danhios&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-06-29 13:35:36', '2021-06-29 13:35:36'),
(21, 3, 'Phung', 'phung@yopmail.com', '$2y$08$vaVdcROZoRkLk.9uM4PWFe/KnLfEpxJDoCln05xPyO/QfKTIsqRtW', 'https://ui-avatars.com/api/?name=Phung&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-06-30 17:06:04', '2021-06-30 17:06:04'),
(22, 3, 'phung', 'phung@yop.net', '$2y$08$jH6pidPGSD/ih/LvLeXKLeV/Y2ASjyFqHzfVQazOSZViyzEMoa1C6', 'https://ui-avatars.com/api/?name=phung&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-06-30 17:32:29', '2021-06-30 17:32:29'),
(23, 3, 'phung', 'dsf@e.net', '$2y$08$k1I.3I4iQ6VlecEivUw0nuq5fJC7ehGqgqCFS9zOX7PjuOdgYLrfK', 'https://ui-avatars.com/api/?name=phung&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-06-30 17:34:24', '2021-06-30 17:34:24'),
(24, 3, 'phung', 'phung1@yopmail.com', '$2y$08$8GdPf/89kES23j00SwBJ8OHibK.tJ6bsMcB7gqHqZS0eDauXkCl52', 'https://ui-avatars.com/api/?name=phung&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-06-30 17:42:48', '2021-06-30 17:42:48'),
(25, 3, 'shohel', 'aa@gmail.com', '$2y$08$jMakp64QLbaBrZpcVv/Te.rKp9CZDd9e4Uv4R/j43NsziMXCWvri.', 'https://ui-avatars.com/api/?name=shohel&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-06-30 17:58:27', '2021-06-30 17:58:27'),
(26, 3, 'test', 'testmail@gmail.com', '$2y$08$rZuGVu/Ohc2eepLq0hgZLu3dIYSkPMJP3g5QWvuK2OhFGhQ1Spj2u', 'https://ui-avatars.com/api/?name=test&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-06-30 18:09:22', '2021-06-30 18:09:22'),
(27, 1, 'abu', 'a@gmail.com', '$2y$08$A.3ly5IcIz1lPJF9rS4MT.DXEn9HGJy7n2KDZoD8sve4rPj/AdFuS', 'https://ui-avatars.com/api/?name=abu&color=7F9CF5&background=EBF4FF', NULL, NULL, NULL, NULL, 0, 1, 0, NULL, '2021-07-01 10:17:07', '2021-07-01 10:17:07'),
(28, 2, 'chnvyj', 'estherlai1999@gmail.com', '$2y$08$wnxtgJQ3nc4N7p/UwxtYm.ZdEfzmqWDoc0g7kFAQIyyRxL33184fe', 'https://storage.googleapis.com/store-backend/avatar/chnvyj-aedb4f9e-175f-4633-a185-89d06c1410b3.jpeg', NULL, NULL, '2021-07-01 00:00:00', 'male', 0, 1, 0, NULL, '2021-07-01 10:43:14', '2021-07-01 12:18:13'),
(29, 2, 'terry', 'cowardomi@yahoo.com', '$2y$08$mn8UECCXl6PLaKNn3kiDgeBJGeBvVpka2mvM7lzDkQ8kBL0DNt3NK', 'https://ui-avatars.com/api/?name=terry&color=7F9CF5&background=EBF4FF', '6598593771', NULL, '1983-03-25 00:00:00', 'male', 0, 1, 0, NULL, '2021-07-01 11:46:28', '2021-07-01 11:48:57'),
(30, 2, 'KOO SING MEI', 'koosingmei@gmail.com', '$2y$08$XycaNKU4zG4rlfLbBKZKLuyBsMwZzHqvCG1/wdeAsN8zcCQzw2Xne', 'http://qa.seedintech.xyz/services/File/photo?s=75x75&crop=1&t=4427&token=b6f027ecc60a16e61826a5e95dd22823_1625114751', '96233008', NULL, '1996-08-13 08:00:00', 'female', 0, 1, 1, NULL, '2021-07-01 12:45:52', '2021-07-01 12:45:52');

--
-- Dumping data for table `user_addresses`
--

INSERT INTO `user_addresses` (`id`, `user_id`, `full_address`, `block_no`, `unit_no`, `building_name`, `postal_code`, `created_at`, `updated_at`) VALUES
(1, 1, 'Foot Step Street, Walkway corner. Run City.', '', '', 'Dev Tower', 'S89709', '2021-06-29 20:38:18', '2021-06-29 21:44:06'),
(2, 1, ' Store Sky', '', '', 'Sky Tower', '20000', '2021-06-29 20:58:04', '2021-06-29 20:58:04'),
(3, 1, ' Store Sky 222222', '1111', '15678', 'Sky Tower 22222', '200000000', '2021-06-30 01:05:58', '2021-06-30 19:04:14'),
(6, 1, 'Foot Step Street, Walkway corner. Run City.', '11', '11', 'Dev Tower', 'S89709', '2021-06-30 18:58:19', '2021-06-30 18:58:30'),
(7, 1, 'test', 'test', '19', 'test', '19', '2021-06-30 19:04:34', '2021-06-30 19:04:34');

--
-- Dumping data for table `user_fcms`
--

INSERT INTO `user_fcms` (`id`, `user_id`, `fcm_token`, `fcm_topics`, `status`, `created_at`, `updated_at`) VALUES
(1, 13, 'fT8sR5JYTzGZC4UCNKmlTp:APA91bEffQBDonIzQk-fA2kd5g3awJ85Z4VHbOYBnpfEb-kVb-teirnEWFhdMAu1m3JWoQBGD1eHEm2nB_bMKok6BmreVpIP-l9R283bipkTbxxD_02YXwun6xgkNiXuLMis5AVNPN5V', '1', 1, '2021-06-27 16:26:07', '2021-06-27 16:34:01');

--
-- Dumping data for table `vouchers`
--

INSERT INTO `vouchers` (`id`, `name`, `description`, `code`, `product_id`, `category_id`, `brand_id`, `type`, `minimum_purchase`, `quantity`, `amount`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Welcome Voucher', 'This voucher is blablabla', 'WELCOME2021', NULL, NULL, NULL, 1, 0, 100, 10, 1, '2021-06-21 12:31:34', '2021-06-21 12:31:34'),
(2, 'Welcome Voucher 2', 'This voucher is blablabla', 'WELCOME2022', NULL, NULL, NULL, 1, 0, 100, 10, 1, '2021-06-21 23:02:44', '2021-06-21 23:02:44'),
(3, 'Welcome Voucher 2', 'This voucher is blablabla', 'WELCOME2023', NULL, NULL, NULL, 1, 0, 100, 10, 1, '2021-06-21 23:02:48', '2021-06-21 23:02:48'),
(4, 'Welcome Voucher 2', 'This voucher is blablabla', 'WELCOME2024', NULL, NULL, NULL, 1, 0, 100, 10, 1, '2021-06-21 23:02:51', '2021-06-21 23:02:51'),
(5, 'Welcome Voucher 2', 'This voucher is blablabla', 'WELCOME2025', NULL, NULL, NULL, 1, 0, 100, 10, 1, '2021-06-21 23:02:54', '2021-06-21 23:02:54'),
(6, 'Welcome Voucher 2', 'This voucher is blablabla', 'WELCOME2026', NULL, NULL, NULL, 1, 0, 100, 10, 1, '2021-06-21 23:02:58', '2021-06-21 23:02:58'),
(7, 'Welcome Voucher 2', 'This voucher is blablabla', 'WELCOME2027', NULL, NULL, NULL, 1, 0, 100, 10, 1, '2021-06-21 23:03:01', '2021-06-21 23:03:01'),
(8, 'Welcome Voucher 2', 'This voucher is blablabla', 'WELCOME2028', NULL, NULL, NULL, 1, 0, 100, 10, 1, '2021-06-21 23:03:04', '2021-06-21 23:03:04'),
(9, 'Welcome Voucher 2', 'This voucher is blablabla', 'WELCOME2029', NULL, NULL, NULL, 1, 0, 100, 10, 1, '2021-06-21 23:03:07', '2021-06-21 23:03:07'),
(10, 'Welcome Voucher 2', 'This voucher is blablabla', 'WELCOME2030', NULL, NULL, NULL, 1, 0, 100, 10, 1, '2021-06-21 23:03:11', '2021-06-21 23:03:11'),
(11, 'Welcome Voucher 2', 'This voucher is blablabla', 'WELCOME2031', NULL, NULL, NULL, 1, 0, 100, 10, 1, '2021-06-21 23:03:14', '2021-06-21 23:03:14'),
(12, 'Welcome Voucher 2', 'This voucher is blablabla', 'WELCOME2032', NULL, NULL, NULL, 1, 0, 100, 10, 1, '2021-06-21 23:03:17', '2021-06-21 23:03:17'),
(13, 'voucher234', 'test1', 'BEHGD', NULL, NULL, NULL, 0, 0, 1000, 100, 1, '2021-06-22 23:39:09', '2021-06-28 17:06:56'),
(14, 'Test vocuher', '222', '111', NULL, NULL, NULL, 0, 222, 2221, 11, 0, '2021-06-23 02:42:44', '2021-06-23 02:42:44'),
(15, 'SR-Voucher 2', '222', '1112', NULL, NULL, NULL, 1, 222, 2221, 11, 1, '2021-06-23 02:43:12', '2021-06-25 16:17:03'),
(16, 'SR-Voucher3', '1111', '231', NULL, NULL, NULL, 1, 1, 1, 1, 1, '2021-06-23 11:58:19', '2021-06-29 13:54:30'),
(17, 'voucher_phung down 100', 'All Ok', '232', NULL, NULL, NULL, 1, 1, 6, 100, 1, '2021-06-29 13:55:24', '2021-06-29 19:49:50'),
(18, 'test', 'test', '123', NULL, NULL, NULL, 0, 3, 35, 100, 1, '2021-06-29 14:44:32', '2021-06-29 14:44:32'),
(19, 'test 1', 'test', '123', NULL, NULL, NULL, 0, 1, 35, 1, 1, '2021-06-29 14:44:32', '2021-06-29 14:49:56');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
