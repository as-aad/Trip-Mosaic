-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 31, 2025 at 07:15 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `travel_db`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateAdminStatistics` ()   BEGIN
    DECLARE user_count INT;
    DECLARE dest_count INT;
    DECLARE blog_count INT;
    DECLARE avg_rating DECIMAL(3,2);
    DECLARE review_count INT;
    
    -- Count total users
    SELECT COUNT(*) INTO user_count FROM users;
    
    -- Count users by role
    UPDATE admin_statistics SET
        total_users = user_count,
        travelers = (SELECT COUNT(*) FROM users WHERE role = 'traveler'),
        guides = (SELECT COUNT(*) FROM users WHERE role = 'guide'),
        restaurant_owners = (SELECT COUNT(*) FROM users WHERE role = 'restaurant_owner'),
        hotel_owners = (SELECT COUNT(*) FROM users WHERE role = 'hotel_owner'),
        admins = (SELECT COUNT(*) FROM users WHERE role = 'admin');
    
    -- Count destinations
    SELECT COUNT(*) INTO dest_count FROM destinations;
    UPDATE admin_statistics SET total_destinations = dest_count;
    
    -- Count blog posts
    SELECT COUNT(*) INTO blog_count FROM blog_posts;
    UPDATE admin_statistics SET total_blog_posts = blog_count;
    
    -- Calculate average rating
    SELECT COALESCE(AVG(rating), 0.0) INTO avg_rating FROM destinations WHERE rating IS NOT NULL;
    UPDATE admin_statistics SET average_rating = avg_rating;
    
    -- Count reviews
    SELECT COUNT(*) INTO review_count FROM reviews;
    UPDATE admin_statistics SET total_reviews = review_count;
    
    -- Update timestamp
    UPDATE admin_statistics SET last_updated = CURRENT_TIMESTAMP;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `admin_activity_log`
--

CREATE TABLE `admin_activity_log` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `admin_dashboard_view`
-- (See below for the actual view)
--
CREATE TABLE `admin_dashboard_view` (
`total_users` int(11)
,`travelers` int(11)
,`guides` int(11)
,`restaurant_owners` int(11)
,`hotel_owners` int(11)
,`admins` int(11)
,`total_destinations` int(11)
,`total_blog_posts` int(11)
,`average_rating` decimal(3,2)
,`total_reviews` int(11)
,`last_updated` timestamp
);

-- --------------------------------------------------------

--
-- Table structure for table `admin_statistics`
--

CREATE TABLE `admin_statistics` (
  `id` int(11) NOT NULL,
  `total_users` int(11) DEFAULT 0,
  `travelers` int(11) DEFAULT 0,
  `guides` int(11) DEFAULT 0,
  `restaurant_owners` int(11) DEFAULT 0,
  `hotel_owners` int(11) DEFAULT 0,
  `admins` int(11) DEFAULT 0,
  `total_destinations` int(11) DEFAULT 0,
  `total_blog_posts` int(11) DEFAULT 0,
  `average_rating` decimal(3,2) DEFAULT 0.00,
  `total_reviews` int(11) DEFAULT 0,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `admin_statistics`
--

INSERT INTO `admin_statistics` (`id`, `total_users`, `travelers`, `guides`, `restaurant_owners`, `hotel_owners`, `admins`, `total_destinations`, `total_blog_posts`, `average_rating`, `total_reviews`, `last_updated`) VALUES
(1, 8, 2, 2, 1, 2, 1, 10, 0, 4.73, 1, '2025-08-30 05:40:55');

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('admin') NOT NULL DEFAULT 'admin',
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `email`, `name`, `role`, `password_hash`, `created_at`, `updated_at`) VALUES
(2, 'adminasad@gmail.com', 'Admin Asad', 'admin', '$2b$12$C4GQABuTz8sjItt9jiPQ2eObqwz2tJbvQ/eKUen0wjB.dFIPQUXxy', '2025-08-24 22:11:39', '2025-08-24 22:11:39');

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `author_id` int(11) NOT NULL,
  `destination_id` int(11) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `destinations`
--

CREATE TABLE `destinations` (
  `id` int(11) NOT NULL,
  `destination_id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(500) NOT NULL,
  `rating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `reviews_count` int(11) DEFAULT 0,
  `description` text DEFAULT NULL,
  `highlights` text DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `city` varchar(100) NOT NULL DEFAULT 'Unknown City',
  `about` text DEFAULT NULL,
  `key_sights` text DEFAULT NULL,
  `best_time_to_visit` varchar(200) DEFAULT NULL,
  `weather` varchar(200) DEFAULT NULL,
  `currency` varchar(50) DEFAULT NULL,
  `language` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `destinations`
--

INSERT INTO `destinations` (`id`, `destination_id`, `name`, `image`, `rating`, `reviews_count`, `description`, `highlights`, `country`, `region`, `created_at`, `updated_at`, `city`, `about`, `key_sights`, `best_time_to_visit`, `weather`, `currency`, `language`) VALUES
(1, 'bali', 'Bali, Indonesia', 'https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg?auto=compress&cs=tinysrgb&w=800', 4.90, 12847, 'Bali is a tropical paradise known for its stunning beaches, ancient temples, lush rice terraces, and vibrant culture. This Indonesian island offers a perfect blend of relaxation and adventure.\\', 'Beaches, Culture, Adventure, Yoga retreats, Rice terraces', 'Indonesia', 'Asia', '2025-08-23 21:56:44', '2025-08-25 14:26:45', 'Seminyak', '', '', 'April to October', 'Tropical, 26-30°C', 'Indonesian Rupiah (IDR)', 'Indonesian, Balinese'),
(2, 'tokyo', 'Tokyo, Japan', 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800', 4.80, 18932, 'Modern metropolis blending cutting-edge technology with traditional culture', 'Culture, Food, Technology', 'Japan', 'Asia', '2025-08-23 21:56:44', '2025-08-30 04:46:46', 'Unknown City', NULL, NULL, 'NOW', 'cool', 'taka', 'english'),
(3, 'santorini', 'Santorini, Greece', 'https://www.royalcaribbean.com/media-assets/pmc/content/dam/shore-x/santorini-jtr/soc2-pyrgos-village-and-fira-town-with-wine-tasting/stock-photo-fira-town-volcano-sea-santorini_149799614.jpg?w=1024', 4.70, 9654, 'Iconic white-washed buildings overlooking crystal-clear Aegean waters', 'Romance, Beaches, History', 'Greece', 'Europe', '2025-08-23 21:56:44', '2025-08-25 21:24:54', 'Unknown City', NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'dubai', 'Dubai, UAE', 'https://images.pexels.com/photos/1467300/pexels-photo-1467300.jpeg?auto=compress&cs=tinysrgb&w=800', 4.60, 15678, 'Futuristic city with luxury shopping, stunning architecture, and desert adventures', 'Luxury, Shopping, Desert', 'UAE', 'Middle East', '2025-08-23 21:56:44', '2025-08-23 21:56:44', 'Unknown City', NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'iceland', 'Reykjavik, Iceland', 'https://quarkexpeditions-website.s3.amazonaws.com/uploads/2024/09/Intro_Reykjavik20Cityscape_AdobeStock_208894627-1-1024x731.jpeg', 4.80, 7432, 'Land of fire and ice with geysers, waterfalls, and Northern Lights', 'Nature, Adventure, Northern Lights', 'Iceland', 'Europe', '2025-08-23 21:56:44', '2025-08-25 21:26:51', 'Unknown City', NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'DEST002', 'Sundarbans', 'https://upload.wikimedia.org/wikipedia/commons/2/23/Sundarban_Tiger.jpg', 4.70, 150, 'World’s largest mangrove forest.', '', 'Bangladesh', 'Khulna', '2025-08-25 20:57:08', '2025-08-25 21:28:41', 'Mongla', 'Home of the Royal Bengal Tiger', '', '', '', '', ''),
(8, 'DEST008', 'Cox’s Bazar', 'https://media-cdn.tripadvisor.com/media/photo-c/1280x250/10/e2/f8/43/longest-sea-beach-in.jpg', 4.50, 200, 'Longest sea beach in the world.', '', 'Bangladesh', 'Chittagong', '2025-08-25 20:58:43', '2025-08-25 21:38:05', 'Cox’s Bazar', 'Perfect for beach lovers', '', '', '', '', ''),
(10, 'DEST010', 'Saint Martin Island', 'https://upload.wikimedia.org/wikipedia/commons/d/db/Saint_Martins_Island_with_boats_in_foreground.jpg', 4.80, 180, 'Beautiful coral island.', NULL, 'Bangladesh', 'Chittagong', '2025-08-25 20:58:43', '2025-08-25 21:22:50', 'Saint Martin', 'Paradise for sea lovers.', NULL, NULL, NULL, NULL, NULL),
(11, 'DEST011', 'Bandarban', 'https://travelsetu.com/apps/uploads/new_destinations_photos/destination/2024/06/29/983a5752ef7bdbf6b5465197e079e85f_1000x1000.jpg', 4.60, 220, 'Hill tracts with scenic views.', '', 'Bangladesh', 'Chittagong', '2025-08-25 20:58:43', '2025-08-25 21:39:12', 'Bandarban', 'Great for hiking and nature.', '', '', '', '', ''),
(12, 'DEST012', 'Sajek Valley', 'https://travelinbangladesh.travel.blog/wp-content/uploads/2019/12/discover-sajek-valley-1024x701.jpg?w=1024', 4.90, 250, 'Valley of clouds and hills.', '', 'Bangladesh', 'Rangamati', '2025-08-25 20:58:43', '2025-08-25 21:40:09', 'Baghaichhari', 'Perfect for mountain adventures.', '', '', '', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `guest_requests`
--

CREATE TABLE `guest_requests` (
  `request_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `request_type` enum('early_checkin','late_checkout','room_service','housekeeping','maintenance','other') NOT NULL,
  `request_status` enum('pending','in_progress','completed','declined') DEFAULT 'pending',
  `request_details` text NOT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `assigned_to` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guides`
--

CREATE TABLE `guides` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `destination_id` int(11) NOT NULL,
  `bio` text DEFAULT NULL,
  `experience_years` int(11) DEFAULT NULL,
  `languages` varchar(500) DEFAULT NULL,
  `specialties` varchar(500) DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `profile_image` varchar(500) DEFAULT NULL,
  `certifications` text DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT NULL,
  `total_reviews` int(11) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `guides`
--

INSERT INTO `guides` (`id`, `user_id`, `destination_id`, `bio`, `experience_years`, `languages`, `specialties`, `hourly_rate`, `phone`, `email`, `profile_image`, `certifications`, `rating`, `total_reviews`, `is_verified`, `is_active`, `created_at`, `updated_at`) VALUES
(6, 15, 8, 'mmmmeeeee', 10, 'test', 'test', 1.15, '01799459598', 'guide1@gmail.com', 'https://imgv3.fotor.com/images/slider-image/A-clear-image-of-a-woman-wearing-red-sharpened-by-Fotors-image-sharpener.jpg', 'test', 0.00, 0, 0, 1, '2025-08-28 20:38:21', '2025-08-28 20:44:18');

-- --------------------------------------------------------

--
-- Table structure for table `guide_destinations`
--

CREATE TABLE `guide_destinations` (
  `id` int(11) NOT NULL,
  `guide_id` int(11) NOT NULL,
  `destination_id` int(11) NOT NULL,
  `is_available` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guide_reviews`
--

CREATE TABLE `guide_reviews` (
  `id` int(11) NOT NULL,
  `guide_id` int(11) NOT NULL,
  `traveler_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `review_text` text DEFAULT NULL,
  `tour_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hotels`
--

CREATE TABLE `hotels` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(500) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `rating` float NOT NULL,
  `reviews` int(11) NOT NULL,
  `price_range` varchar(50) DEFAULT NULL,
  `amenities` text DEFAULT NULL,
  `room_types_text` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `destination_id` int(11) NOT NULL,
  `check_in_time` time DEFAULT '15:00:00',
  `check_out_time` time DEFAULT '11:00:00',
  `cancellation_policy` text DEFAULT NULL,
  `booking_enabled` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `hotels`
--

INSERT INTO `hotels` (`id`, `name`, `owner_id`, `description`, `address`, `city`, `country`, `phone`, `email`, `website`, `image`, `rating`, `reviews`, `price_range`, `amenities`, `room_types_text`, `is_active`, `created_at`, `updated_at`, `destination_id`, `check_in_time`, `check_out_time`, `cancellation_policy`, `booking_enabled`) VALUES
(10, 'Radison Blue', 19, 'test description', 'test', NULL, NULL, '01799459598', 'hotelowner1@gmail.com', 'https://test.com', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/324586035.jpg?k=26ca5f72473d63d6cc1a2473f5c51f32e052a931e9b2e148fb55b21346ed7fbf&o=&hp=1', 0, 0, '$$$$', 'Wifi , Pool , Gym', 'test price', 1, '2025-08-26 03:54:20', '2025-08-26 11:17:07', 8, '15:00:00', '11:00:00', NULL, 1),
(11, 'Intercontinental', 19, 'test', 'test', NULL, NULL, '01799459598', 'hotelowner1@gmail.com', 'https://test.com', 'https://digital.ihg.com/is/image/ihg/intercontinental-osaka-4086748091-2x1', 0, 0, '$$$$', 'wifi, pool, gym', 'test', 1, '2025-08-26 11:18:49', '2025-08-26 11:20:51', 2, '15:00:00', '11:00:00', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `hotel_bookings`
--

CREATE TABLE `hotel_bookings` (
  `booking_id` int(11) NOT NULL,
  `hotel_id` int(11) NOT NULL,
  `traveler_id` int(11) NOT NULL,
  `room_type` varchar(100) NOT NULL,
  `check_in_date` date NOT NULL,
  `check_out_date` date NOT NULL,
  `num_guests` int(11) DEFAULT 1,
  `total_price` decimal(10,2) NOT NULL,
  `booking_status` enum('pending','confirmed','checked_in','checked_out','cancelled') DEFAULT 'pending',
  `special_requests` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `hotel_bookings`
--

INSERT INTO `hotel_bookings` (`booking_id`, `hotel_id`, `traveler_id`, `room_type`, `check_in_date`, `check_out_date`, `num_guests`, `total_price`, `booking_status`, `special_requests`, `created_at`, `updated_at`) VALUES
(1, 11, 23, 'Standard Room', '2025-08-31', '2025-09-03', 3, 300.00, 'checked_in', 'early checkin', '2025-08-30 07:55:22', '2025-08-30 08:20:15'),
(2, 11, 23, 'Standard Room', '2025-09-01', '2025-09-02', 1, 100.00, 'pending', NULL, '2025-08-30 09:21:58', '2025-08-30 09:21:58');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_room_types`
--

CREATE TABLE `hotel_room_types` (
  `room_type_id` int(11) NOT NULL,
  `hotel_id` int(11) NOT NULL,
  `room_type_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `base_price_per_night` decimal(10,2) NOT NULL,
  `max_guests` int(11) DEFAULT 2,
  `amenities` text DEFAULT NULL,
  `total_rooms` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `hotel_room_types`
--

INSERT INTO `hotel_room_types` (`room_type_id`, `hotel_id`, `room_type_name`, `description`, `base_price_per_night`, `max_guests`, `amenities`, `total_rooms`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 10, 'Standard Room', 'Comfortable standard room with basic amenities', 100.00, 2, 'WiFi, TV, Air Conditioning, Private Bathroom', 10, 1, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(2, 11, 'Standard Room', 'Comfortable standard room with basic amenities', 100.00, 2, 'WiFi, TV, Air Conditioning, Private Bathroom', 10, 1, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(4, 10, 'Deluxe Room', 'Spacious deluxe room with premium amenities', 150.00, 3, 'WiFi, TV, Air Conditioning, Private Bathroom, Mini Bar, Balcony', 5, 1, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(5, 11, 'Deluxe Room', 'Spacious deluxe room with premium amenities', 150.00, 3, 'WiFi, TV, Air Conditioning, Private Bathroom, Mini Bar, Balcony', 5, 1, '2025-08-30 07:19:25', '2025-08-30 07:19:25');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `restaurants`
--

CREATE TABLE `restaurants` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `cuisine_type` varchar(100) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `website` varchar(500) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `rating` float NOT NULL,
  `reviews` int(11) NOT NULL,
  `price_range` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `menu_image` varchar(500) DEFAULT NULL,
  `destination_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `restaurants`
--

INSERT INTO `restaurants` (`id`, `name`, `owner_id`, `description`, `cuisine_type`, `address`, `phone`, `website`, `image`, `rating`, `reviews`, `price_range`, `is_active`, `created_at`, `updated_at`, `menu_image`, `destination_id`) VALUES
(9, 'Sultan Dine', 22, 'test', 'asian', 'test adress', '01799459598', 'https://test.com', 'https://www.moumachi.com.bd/images/listings/40565/profile/20235-sultans-dine-logo.jpg', 0, 0, '$', 1, '2025-08-27 01:17:04', NULL, 'https://media-cdn.tripadvisor.com/media/photo-i/17/1c/7a/4b/menu.jpg', 7);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `destination_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` decimal(3,2) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `destination_id`, `user_id`, `rating`, `comment`, `created_at`) VALUES
(1, 2, 23, 4.00, 'nicee', '2025-08-30 05:22:12'),
(2, 2, 25, 5.00, 'very niceee', '2025-08-30 05:41:40'),
(3, 1, 25, 1.00, 'not goodd', '2025-08-30 05:42:44');

-- --------------------------------------------------------

--
-- Table structure for table `room_availability`
--

CREATE TABLE `room_availability` (
  `availability_id` int(11) NOT NULL,
  `hotel_id` int(11) NOT NULL,
  `room_type` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `total_rooms` int(11) DEFAULT 0,
  `available_rooms` int(11) DEFAULT 0,
  `price_per_night` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `room_availability`
--

INSERT INTO `room_availability` (`availability_id`, `hotel_id`, `room_type`, `date`, `total_rooms`, `available_rooms`, `price_per_night`, `created_at`, `updated_at`) VALUES
(1, 10, 'Standard Room', '2025-08-30', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(2, 11, 'Standard Room', '2025-08-30', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(3, 10, 'Deluxe Room', '2025-08-30', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(4, 11, 'Deluxe Room', '2025-08-30', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(5, 10, 'Standard Room', '2025-08-31', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(6, 11, 'Standard Room', '2025-08-31', 10, 9, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:55:22'),
(7, 10, 'Deluxe Room', '2025-08-31', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(8, 11, 'Deluxe Room', '2025-08-31', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(9, 10, 'Standard Room', '2025-09-01', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(10, 11, 'Standard Room', '2025-09-01', 10, 8, 100.00, '2025-08-30 07:19:25', '2025-08-30 09:21:58'),
(11, 10, 'Deluxe Room', '2025-09-01', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(12, 11, 'Deluxe Room', '2025-09-01', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(13, 10, 'Standard Room', '2025-09-02', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(14, 11, 'Standard Room', '2025-09-02', 10, 9, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:55:22'),
(15, 10, 'Deluxe Room', '2025-09-02', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(16, 11, 'Deluxe Room', '2025-09-02', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(17, 10, 'Standard Room', '2025-09-03', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(18, 11, 'Standard Room', '2025-09-03', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(19, 10, 'Deluxe Room', '2025-09-03', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(20, 11, 'Deluxe Room', '2025-09-03', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(21, 10, 'Standard Room', '2025-09-04', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(22, 11, 'Standard Room', '2025-09-04', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(23, 10, 'Deluxe Room', '2025-09-04', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(24, 11, 'Deluxe Room', '2025-09-04', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(25, 10, 'Standard Room', '2025-09-05', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(26, 11, 'Standard Room', '2025-09-05', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(27, 10, 'Deluxe Room', '2025-09-05', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(28, 11, 'Deluxe Room', '2025-09-05', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(29, 10, 'Standard Room', '2025-09-06', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(30, 11, 'Standard Room', '2025-09-06', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(31, 10, 'Deluxe Room', '2025-09-06', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(32, 11, 'Deluxe Room', '2025-09-06', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(33, 10, 'Standard Room', '2025-09-07', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(34, 11, 'Standard Room', '2025-09-07', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(35, 10, 'Deluxe Room', '2025-09-07', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(36, 11, 'Deluxe Room', '2025-09-07', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(37, 10, 'Standard Room', '2025-09-08', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(38, 11, 'Standard Room', '2025-09-08', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(39, 10, 'Deluxe Room', '2025-09-08', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(40, 11, 'Deluxe Room', '2025-09-08', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(41, 10, 'Standard Room', '2025-09-09', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(42, 11, 'Standard Room', '2025-09-09', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(43, 10, 'Deluxe Room', '2025-09-09', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(44, 11, 'Deluxe Room', '2025-09-09', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(45, 10, 'Standard Room', '2025-09-10', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(46, 11, 'Standard Room', '2025-09-10', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(47, 10, 'Deluxe Room', '2025-09-10', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(48, 11, 'Deluxe Room', '2025-09-10', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(49, 10, 'Standard Room', '2025-09-11', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(50, 11, 'Standard Room', '2025-09-11', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(51, 10, 'Deluxe Room', '2025-09-11', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(52, 11, 'Deluxe Room', '2025-09-11', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(53, 10, 'Standard Room', '2025-09-12', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(54, 11, 'Standard Room', '2025-09-12', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(55, 10, 'Deluxe Room', '2025-09-12', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(56, 11, 'Deluxe Room', '2025-09-12', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(57, 10, 'Standard Room', '2025-09-13', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(58, 11, 'Standard Room', '2025-09-13', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(59, 10, 'Deluxe Room', '2025-09-13', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(60, 11, 'Deluxe Room', '2025-09-13', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(61, 10, 'Standard Room', '2025-09-14', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(62, 11, 'Standard Room', '2025-09-14', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(63, 10, 'Deluxe Room', '2025-09-14', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(64, 11, 'Deluxe Room', '2025-09-14', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(65, 10, 'Standard Room', '2025-09-15', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(66, 11, 'Standard Room', '2025-09-15', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(67, 10, 'Deluxe Room', '2025-09-15', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(68, 11, 'Deluxe Room', '2025-09-15', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(69, 10, 'Standard Room', '2025-09-16', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(70, 11, 'Standard Room', '2025-09-16', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(71, 10, 'Deluxe Room', '2025-09-16', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(72, 11, 'Deluxe Room', '2025-09-16', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(73, 10, 'Standard Room', '2025-09-17', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(74, 11, 'Standard Room', '2025-09-17', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(75, 10, 'Deluxe Room', '2025-09-17', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(76, 11, 'Deluxe Room', '2025-09-17', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(77, 10, 'Standard Room', '2025-09-18', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(78, 11, 'Standard Room', '2025-09-18', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(79, 10, 'Deluxe Room', '2025-09-18', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(80, 11, 'Deluxe Room', '2025-09-18', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(81, 10, 'Standard Room', '2025-09-19', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(82, 11, 'Standard Room', '2025-09-19', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(83, 10, 'Deluxe Room', '2025-09-19', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(84, 11, 'Deluxe Room', '2025-09-19', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(85, 10, 'Standard Room', '2025-09-20', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(86, 11, 'Standard Room', '2025-09-20', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(87, 10, 'Deluxe Room', '2025-09-20', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(88, 11, 'Deluxe Room', '2025-09-20', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(89, 10, 'Standard Room', '2025-09-21', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(90, 11, 'Standard Room', '2025-09-21', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(91, 10, 'Deluxe Room', '2025-09-21', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(92, 11, 'Deluxe Room', '2025-09-21', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(93, 10, 'Standard Room', '2025-09-22', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(94, 11, 'Standard Room', '2025-09-22', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(95, 10, 'Deluxe Room', '2025-09-22', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(96, 11, 'Deluxe Room', '2025-09-22', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(97, 10, 'Standard Room', '2025-09-23', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(98, 11, 'Standard Room', '2025-09-23', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(99, 10, 'Deluxe Room', '2025-09-23', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(100, 11, 'Deluxe Room', '2025-09-23', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(101, 10, 'Standard Room', '2025-09-24', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(102, 11, 'Standard Room', '2025-09-24', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(103, 10, 'Deluxe Room', '2025-09-24', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(104, 11, 'Deluxe Room', '2025-09-24', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(105, 10, 'Standard Room', '2025-09-25', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(106, 11, 'Standard Room', '2025-09-25', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(107, 10, 'Deluxe Room', '2025-09-25', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(108, 11, 'Deluxe Room', '2025-09-25', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(109, 10, 'Standard Room', '2025-09-26', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(110, 11, 'Standard Room', '2025-09-26', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(111, 10, 'Deluxe Room', '2025-09-26', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(112, 11, 'Deluxe Room', '2025-09-26', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(113, 10, 'Standard Room', '2025-09-27', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(114, 11, 'Standard Room', '2025-09-27', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(115, 10, 'Deluxe Room', '2025-09-27', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(116, 11, 'Deluxe Room', '2025-09-27', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(117, 10, 'Standard Room', '2025-09-28', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(118, 11, 'Standard Room', '2025-09-28', 10, 10, 100.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(119, 10, 'Deluxe Room', '2025-09-28', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25'),
(120, 11, 'Deluxe Room', '2025-09-28', 5, 5, 150.00, '2025-08-30 07:19:25', '2025-08-30 07:19:25');

-- --------------------------------------------------------

--
-- Table structure for table `travel_buddies`
--

CREATE TABLE `travel_buddies` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `destination` varchar(100) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `interests` text DEFAULT NULL,
  `budget_range` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'traveler',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `phone`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(5, 'adminasad@gmail.com', '$2b$12$pk6giS0L1DQ2f8D/.mzzyeE0BJGs1ydO2byE7bB7ey8SFOu4SOAhy', 'Admin Asad', '01799459598', 'admin', 1, '2025-08-23 22:44:39', '2025-08-25 12:00:53'),
(15, 'guide1@gmail.com', '$2b$12$gcgq7ofjaHcjOufZqoIS5ed1W3fnfojkyvQxkN96LMb2OVl/hMbQy', 'Guide1', '01799459598', 'guide', 1, '2025-08-25 21:41:47', '2025-08-25 21:41:47'),
(16, 'guide2@gmail.com', '$2b$12$kZulGOXNK7WyLB9AJZ14KuiQAuoMWW4t4lbBQ8DJUlgoWJ9de3vdi', 'Guide2', '01799459598', 'guide', 1, '2025-08-25 21:42:07', '2025-08-25 21:42:07'),
(19, 'hotelowner1@gmail.com', '$2b$12$kUFOpG8kyDH01/Lu.GsbOuZ7Y62RpOMBj4uSEQ08OUfegu5A3vI.G', 'hotelowner1', '01799459598', 'hotel_owner', 1, '2025-08-25 21:43:55', '2025-08-25 21:43:55'),
(20, 'hotelowner2@gmail.com', '$2b$12$/4FFL8yuEZHY6Q3NiUaw5ucRqzbH.O9ROm9TysvkgJ9ROW5UIw7bq', 'hotelowner2', '01799459598', 'hotel_owner', 1, '2025-08-25 21:44:08', '2025-08-25 21:44:08'),
(22, 'resturantowner2@gmail.com', '$2b$12$zhv7os6qs0wzdPpWzuV0oeSEKslNJVl2E.35J0U/SES8Mk4N8rCNC', 'resturantowner2', '01799459598', 'restaurant_owner', 1, '2025-08-25 21:45:24', '2025-08-25 21:45:24'),
(23, 'tourist1@gmail.com', '$2b$12$qf3boyRD6wXjy3hg2Lxf8ejcO1455Sbc9y5XHAjBhTyB7swfcIRe6', 'tourist1', '01799459598', 'traveler', 1, '2025-08-26 05:40:14', '2025-08-26 05:40:14'),
(25, 'tourist2@gmail.com', '$2b$12$iMN2CNnB7NeWlG17e3KF1uXTNGeaTEvWTHXHhw5c3bctJfwi1/hx2', 'tourist2', '01799459598', 'traveler', 1, '2025-08-30 05:40:55', '2025-08-30 05:40:55');

-- --------------------------------------------------------

--
-- Table structure for table `user_management`
--

CREATE TABLE `user_management` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` enum('active','suspended','deleted') DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `last_modified_by` int(11) DEFAULT NULL,
  `last_modified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `user_management`
--

INSERT INTO `user_management` (`id`, `user_id`, `status`, `admin_notes`, `last_modified_by`, `last_modified_at`, `created_at`) VALUES
(1, 5, 'active', 'Auto-created during system setup', NULL, '2025-08-25 10:58:13', NULL),
(3, 6, 'active', 'Auto-created during system setup', NULL, '2025-08-25 10:58:13', NULL),
(4, 4, 'active', 'Auto-created during system setup', NULL, '2025-08-25 10:58:13', NULL),
(7, 12, 'active', 'Auto-created during system setup', NULL, '2025-08-25 10:58:13', NULL);

-- --------------------------------------------------------

--
-- Stand-in structure for view `user_management_view`
-- (See below for the actual view)
--
CREATE TABLE `user_management_view` (
`id` int(11)
,`name` varchar(255)
,`email` varchar(255)
,`phone` varchar(50)
,`role` varchar(50)
,`registration_date` timestamp
,`status` varchar(9)
,`admin_notes` text
,`last_modified_at` timestamp
,`last_modified_by_name` varchar(255)
);

-- --------------------------------------------------------

--
-- Structure for view `admin_dashboard_view`
--
DROP TABLE IF EXISTS `admin_dashboard_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `admin_dashboard_view`  AS SELECT `aus`.`total_users` AS `total_users`, `aus`.`travelers` AS `travelers`, `aus`.`guides` AS `guides`, `aus`.`restaurant_owners` AS `restaurant_owners`, `aus`.`hotel_owners` AS `hotel_owners`, `aus`.`admins` AS `admins`, `aus`.`total_destinations` AS `total_destinations`, `aus`.`total_blog_posts` AS `total_blog_posts`, `aus`.`average_rating` AS `average_rating`, `aus`.`total_reviews` AS `total_reviews`, `aus`.`last_updated` AS `last_updated` FROM `admin_statistics` AS `aus` ;

-- --------------------------------------------------------

--
-- Structure for view `user_management_view`
--
DROP TABLE IF EXISTS `user_management_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `user_management_view`  AS SELECT `u`.`id` AS `id`, `u`.`name` AS `name`, `u`.`email` AS `email`, `u`.`phone` AS `phone`, `u`.`role` AS `role`, `u`.`created_at` AS `registration_date`, coalesce(`um`.`status`,'active') AS `status`, coalesce(`um`.`admin_notes`,'') AS `admin_notes`, coalesce(`um`.`last_modified_at`,`u`.`created_at`) AS `last_modified_at`, coalesce(`admin_user`.`name`,'System') AS `last_modified_by_name` FROM ((`users` `u` left join `user_management` `um` on(`u`.`id` = `um`.`user_id`)) left join `users` `admin_user` on(`um`.`last_modified_by` = `admin_user`.`id`)) ORDER BY `u`.`created_at` DESC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_activity_log`
--
ALTER TABLE `admin_activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_id` (`admin_id`),
  ADD KEY `idx_timestamp` (`timestamp`);

--
-- Indexes for table `admin_statistics`
--
ALTER TABLE `admin_statistics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_last_updated` (`last_updated`);

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_author_id` (`author_id`),
  ADD KEY `idx_destination_id` (`destination_id`),
  ADD KEY `idx_title` (`title`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_blog_posts_author_created` (`author_id`,`created_at`);

--
-- Indexes for table `destinations`
--
ALTER TABLE `destinations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `destination_id` (`destination_id`),
  ADD KEY `idx_destination_id` (`destination_id`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_country` (`country`),
  ADD KEY `idx_region` (`region`),
  ADD KEY `idx_destinations_rating_reviews` (`rating`,`reviews_count`);

--
-- Indexes for table `guest_requests`
--
ALTER TABLE `guest_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_request_status` (`request_status`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `idx_assigned_to` (`assigned_to`);

--
-- Indexes for table `guides`
--
ALTER TABLE `guides`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `ix_guides_id` (`id`),
  ADD KEY `idx_guide_destination_id` (`destination_id`);

--
-- Indexes for table `guide_destinations`
--
ALTER TABLE `guide_destinations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guide_id` (`guide_id`),
  ADD KEY `destination_id` (`destination_id`),
  ADD KEY `ix_guide_destinations_id` (`id`);

--
-- Indexes for table `guide_reviews`
--
ALTER TABLE `guide_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guide_id` (`guide_id`),
  ADD KEY `traveler_id` (`traveler_id`),
  ADD KEY `ix_guide_reviews_id` (`id`);

--
-- Indexes for table `hotels`
--
ALTER TABLE `hotels`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`),
  ADD KEY `ix_hotels_id` (`id`),
  ADD KEY `fk_hotels_destination` (`destination_id`);

--
-- Indexes for table `hotel_bookings`
--
ALTER TABLE `hotel_bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `idx_hotel_id` (`hotel_id`),
  ADD KEY `idx_traveler_id` (`traveler_id`),
  ADD KEY `idx_booking_status` (`booking_status`),
  ADD KEY `idx_check_in_date` (`check_in_date`),
  ADD KEY `idx_check_out_date` (`check_out_date`);

--
-- Indexes for table `hotel_room_types`
--
ALTER TABLE `hotel_room_types`
  ADD PRIMARY KEY (`room_type_id`),
  ADD KEY `idx_hotel_id` (`hotel_id`),
  ADD KEY `idx_room_type_name` (`room_type_name`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `restaurants`
--
ALTER TABLE `restaurants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`),
  ADD KEY `ix_restaurants_id` (`id`),
  ADD KEY `fk_restaurants_destination` (`destination_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_destination_id` (`destination_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_rating` (`rating`);

--
-- Indexes for table `room_availability`
--
ALTER TABLE `room_availability`
  ADD PRIMARY KEY (`availability_id`),
  ADD UNIQUE KEY `unique_hotel_room_date` (`hotel_id`,`room_type`,`date`),
  ADD KEY `idx_hotel_id` (`hotel_id`),
  ADD KEY `idx_room_type` (`room_type`),
  ADD KEY `idx_date` (`date`);

--
-- Indexes for table `travel_buddies`
--
ALTER TABLE `travel_buddies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_destination` (`destination`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_dates` (`start_date`,`end_date`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_users_role_created` (`role`,`created_at`);

--
-- Indexes for table `user_management`
--
ALTER TABLE `user_management`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `last_modified_by` (`last_modified_by`),
  ADD KEY `ix_user_management_id` (`id`),
  ADD KEY `idx_user_management_user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_activity_log`
--
ALTER TABLE `admin_activity_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admin_statistics`
--
ALTER TABLE `admin_statistics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `destinations`
--
ALTER TABLE `destinations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `guest_requests`
--
ALTER TABLE `guest_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guides`
--
ALTER TABLE `guides`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `guide_destinations`
--
ALTER TABLE `guide_destinations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guide_reviews`
--
ALTER TABLE `guide_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hotels`
--
ALTER TABLE `hotels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `hotel_bookings`
--
ALTER TABLE `hotel_bookings`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `hotel_room_types`
--
ALTER TABLE `hotel_room_types`
  MODIFY `room_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `restaurants`
--
ALTER TABLE `restaurants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `room_availability`
--
ALTER TABLE `room_availability`
  MODIFY `availability_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT for table `travel_buddies`
--
ALTER TABLE `travel_buddies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `user_management`
--
ALTER TABLE `user_management`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_activity_log`
--
ALTER TABLE `admin_activity_log`
  ADD CONSTRAINT `admin_activity_log_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD CONSTRAINT `blog_posts_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blog_posts_ibfk_2` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `guest_requests`
--
ALTER TABLE `guest_requests`
  ADD CONSTRAINT `guest_requests_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `hotel_bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `guest_requests_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `guides`
--
ALTER TABLE `guides`
  ADD CONSTRAINT `guides_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `guides_ibfk_2` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `guide_destinations`
--
ALTER TABLE `guide_destinations`
  ADD CONSTRAINT `guide_destinations_ibfk_1` FOREIGN KEY (`guide_id`) REFERENCES `guides` (`id`),
  ADD CONSTRAINT `guide_destinations_ibfk_2` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`);

--
-- Constraints for table `guide_reviews`
--
ALTER TABLE `guide_reviews`
  ADD CONSTRAINT `guide_reviews_ibfk_1` FOREIGN KEY (`guide_id`) REFERENCES `guides` (`id`),
  ADD CONSTRAINT `guide_reviews_ibfk_2` FOREIGN KEY (`traveler_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `hotels`
--
ALTER TABLE `hotels`
  ADD CONSTRAINT `fk_hotels_destination` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`),
  ADD CONSTRAINT `hotels_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `hotel_bookings`
--
ALTER TABLE `hotel_bookings`
  ADD CONSTRAINT `hotel_bookings_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hotel_bookings_ibfk_2` FOREIGN KEY (`traveler_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hotel_room_types`
--
ALTER TABLE `hotel_room_types`
  ADD CONSTRAINT `hotel_room_types_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `restaurants`
--
ALTER TABLE `restaurants`
  ADD CONSTRAINT `fk_restaurants_destination` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `restaurants_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `room_availability`
--
ALTER TABLE `room_availability`
  ADD CONSTRAINT `room_availability_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `travel_buddies`
--
ALTER TABLE `travel_buddies`
  ADD CONSTRAINT `travel_buddies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
