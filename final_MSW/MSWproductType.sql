-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 12, 2019 at 07:23 AM
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
-- Table structure for table `MSWproductType`
--

CREATE TABLE `MSWproductType` (
  `CatID` tinyint(4) NOT NULL,
  `CatName` varchar(40) NOT NULL DEFAULT ''
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `MSWproductType`
--

INSERT INTO `MSWproductType` (`CatID`, `CatName`) VALUES
(1, 'Masonry'),
(2, 'Concrete'),
(3, 'Construction'),
(4, 'OutdoorKitchen');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `MSWproductType`
--
ALTER TABLE `MSWproductType`
  ADD PRIMARY KEY (`CatID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
