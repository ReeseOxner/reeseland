-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 12, 2019 at 07:24 AM
-- Server version: 5.7.28
-- PHP Version: 7.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `reeseuta_4321`
--

-- --------------------------------------------------------

--
-- Table structure for table `MSWImages`
--

CREATE TABLE `MSWImages` (
  `IID` mediumint(9) NOT NULL,
  `ImageURL` varchar(100) NOT NULL DEFAULT '',
  `pageURL` text NOT NULL,
  `title` text NOT NULL,
  `category` text NOT NULL,
  `CatID` tinyint(4) NOT NULL DEFAULT '0',
  `description` text NOT NULL,
  `LinkID` smallint(6) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `MSWImages`
--

INSERT INTO `MSWImages` (`IID`, `ImageURL`, `pageURL`, `title`, `category`, `CatID`, `description`, `LinkID`) VALUES
(1, 'images/kitchen.jpg', 'images/kitchen.jpg', 'Rustic Kitchen', 'Outdoor Kitchen', 4, 'Building the dream outdoor kitchen requires a bit of planning and imagination. Whether you are flipping burgers or boiling a lobster, an outdoor kitchen easily becomes the heart of the home during summer months. Of course, space and budget will influence your decisions, but with a little bit of creativity, an outdoor kitchen can provide you with everything you need and want.\r\n\r\nOutdoor kitchens range in cost from about $3,000 to more than $30,000 depending on what features you choose. To ensure you get a return on your investment, there are some things you must do before you start building your outdoor kitchen.\r\n\r\n', 1),
(2, 'images/kitchen2.jpeg', 'images/kitchen2.jpeg', 'Grill Heaven!', 'Outdoor Kitchen', 4, 'Building the dream outdoor kitchen requires a bit of planning and imagination. Whether you are flipping burgers or boiling a lobster, an outdoor kitchen easily becomes the heart of the home during summer months. Of course, space and budget will influence your decisions, but with a little bit of creativity, an outdoor kitchen can provide you with everything you need and want.\r\n\r\nOutdoor kitchens range in cost from about $3,000 to more than $30,000 depending on what features you choose. To ensure you get a return on your investment, there are some things you must do before you start building your outdoor kitchen.\r\n\r\n', 2),
(3, 'images/kitchen3.jpeg', 'images/kitchen3.jpeg', 'Small Patio', 'Outdoor Kitchen', 4, 'Building the dream outdoor kitchen requires a bit of planning and imagination. Whether you are flipping burgers or boiling a lobster, an outdoor kitchen easily becomes the heart of the home during summer months. Of course, space and budget will influence your decisions, but with a little bit of creativity, an outdoor kitchen can provide you with everything you need and want.\r\n\r\nOutdoor kitchens range in cost from about $3,000 to more than $30,000 depending on what features you choose. To ensure you get a return on your investment, there are some things you must do before you start building your outdoor kitchen.\r\n\r\n', 3),
(4, 'images/kitchen4.jpeg', 'images/kitchen4.jpeg', 'Bar Entertainment', 'Outdoor Kitchen', 4, 'Building the dream outdoor kitchen requires a bit of planning and imagination. Whether you are flipping burgers or boiling a lobster, an outdoor kitchen easily becomes the heart of the home during summer months. Of course, space and budget will influence your decisions, but with a little bit of creativity, an outdoor kitchen can provide you with everything you need and want.\r\n\r\nOutdoor kitchens range in cost from about $3,000 to more than $30,000 depending on what features you choose. To ensure you get a return on your investment, there are some things you must do before you start building your outdoor kitchen.\r\n\r\n', 4),
(5, 'images/masonry.jpeg', 'images/masonry.jpeg', 'Brick wall', 'Masonry', 1, 'Building the dream outdoor kitchen requires a bit of planning and imagination. Whether you are flipping burgers or boiling a lobster, an outdoor kitchen easily becomes the heart of the home during summer months. Of course, space and budget will influence your decisions, but with a little bit of creativity, an outdoor kitchen can provide you with everything you need and want.\r\n\r\nOutdoor kitchens range in cost from about $3,000 to more than $30,000 depending on what features you choose. To ensure you get a return on your investment, there are some things you must do before you start building your outdoor kitchen.\r\n\r\n', 5),
(6, 'images/masonry2.jpeg', 'images/masonry2.jpeg', 'Rock Room', 'Masonry', 1, 'Building the dream outdoor kitchen requires a bit of planning and imagination. Whether you are flipping burgers or boiling a lobster, an outdoor kitchen easily becomes the heart of the home during summer months. Of course, space and budget will influence your decisions, but with a little bit of creativity, an outdoor kitchen can provide you with everything you need and want.\r\n\r\nOutdoor kitchens range in cost from about $3,000 to more than $30,000 depending on what features you choose. To ensure you get a return on your investment, there are some things you must do before you start building your outdoor kitchen.\r\n\r\n', 6),
(7, 'images/masonry3.jpeg', 'images/masonry3.jpeg', 'Pizza Time!', 'Masonry', 1, 'Building the dream outdoor kitchen requires a bit of planning and imagination. Whether you are flipping burgers or boiling a lobster, an outdoor kitchen easily becomes the heart of the home during summer months. Of course, space and budget will influence your decisions, but with a little bit of creativity, an outdoor kitchen can provide you with everything you need and want.\r\n\r\nOutdoor kitchens range in cost from about $3,000 to more than $30,000 depending on what features you choose. To ensure you get a return on your investment, there are some things you must do before you start building your outdoor kitchen.\r\n\r\n', 7),
(8, 'images/masonry4.jpeg', 'images/masonry4.jpeg', 'School House ROCK', 'Masonry', 1, 'Building the dream outdoor kitchen requires a bit of planning and imagination. Whether you are flipping burgers or boiling a lobster, an outdoor kitchen easily becomes the heart of the home during summer months. Of course, space and budget will influence your decisions, but with a little bit of creativity, an outdoor kitchen can provide you with everything you need and want.\r\n\r\nOutdoor kitchens range in cost from about $3,000 to more than $30,000 depending on what features you choose. To ensure you get a return on your investment, there are some things you must do before you start building your outdoor kitchen.\r\n\r\n', 8),
(9, 'images/construction.jpeg', 'images/construction.jpeg', 'Large scale construction', 'construction', 3, 'Building the dream outdoor kitchen requires a bit of planning and imagination. Whether you are flipping burgers or boiling a lobster, an outdoor kitchen easily becomes the heart of the home during summer months. Of course, space and budget will influence your decisions, but with a little bit of creativity, an outdoor kitchen can provide you with everything you need and want.\r\n\r\nOutdoor kitchens range in cost from about $3,000 to more than $30,000 depending on what features you choose. To ensure you get a return on your investment, there are some things you must do before you start building your outdoor kitchen.\r\n\r\n', 9),
(10, 'images/construction2.jpeg', 'images/construction2.jpeg', 'Buildings!', 'construction', 3, 'Building the dream outdoor kitchen requires a bit of planning and imagination. Whether you are flipping burgers or boiling a lobster, an outdoor kitchen easily becomes the heart of the home during summer months. Of course, space and budget will influence your decisions, but with a little bit of creativity, an outdoor kitchen can provide you with everything you need and want.\r\n\r\nOutdoor kitchens range in cost from about $3,000 to more than $30,000 depending on what features you choose. To ensure you get a return on your investment, there are some things you must do before you start building your outdoor kitchen.\r\n\r\n', 10),
(11, 'images/construction3.jpeg', 'images/construction3.jpeg', 'Memorials', 'construction', 3, '', 11),
(12, 'images/construction4.jpeg', 'images/construction4.jpeg', 'Houses', 'construction', 3, '', 12),
(13, 'images/construction5.jpeg', 'images/construction5.jpeg', 'Warehouse', 'construction', 3, 'Building the dream outdoor kitchen requires a bit of planning and imagination. Whether you are flipping burgers or boiling a lobster, an outdoor kitchen easily becomes the heart of the home during summer months. Of course, space and budget will influence your decisions, but with a little bit of creativity, an outdoor kitchen can provide you with everything you need and want.\r\n\r\nOutdoor kitchens range in cost from about $3,000 to more than $30,000 depending on what features you choose. To ensure you get a return on your investment, there are some things you must do before you start building your outdoor kitchen.\r\n\r\n', 13),
(14, 'images/construction6.jpeg', 'images/construction6.jpeg', 'Tiny House', 'construction', 3, 'Building the dream outdoor kitchen requires a bit of planning and imagination. Whether you are flipping burgers or boiling a lobster, an outdoor kitchen easily becomes the heart of the home during summer months. Of course, space and budget will influence your decisions, but with a little bit of creativity, an outdoor kitchen can provide you with everything you need and want.\r\n\r\nOutdoor kitchens range in cost from about $3,000 to more than $30,000 depending on what features you choose. To ensure you get a return on your investment, there are some things you must do before you start building your outdoor kitchen.\r\n\r\n', 14),
(29, 'https://bloximages.newyork1.vip.townnews.com/theshorthorn.com/content/tncms/assets/v3/editorial/6/f9', 'https://bloximages.newyork1.vip.townnews.com/theshorthorn.com/content/tncms/assets/v3/editorial/6/f9/6f9f460a-aaf7-11e8-a036-c76ee0b7e0e1/5b85a08220c2d.image.jpg?resize=500%2C750', 'BRIAN LOPEZ', 'DUMBASSES', 1, '', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `MSWImages`
--
ALTER TABLE `MSWImages`
  ADD PRIMARY KEY (`IID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `MSWImages`
--
ALTER TABLE `MSWImages`
  MODIFY `IID` mediumint(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
