-- phpMyAdmin SQL Dump

-- --------------------------------------------------------

--
-- Table structure for table `TagForLink`
--

CREATE TABLE `TagForLink` (
  `TagID` tinyint(4) NOT NULL,
  `TagName` varchar(100) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `TagForLink`
--

INSERT INTO `TagForLink` (`TagID`, `TagName`) VALUES
(1, 'Beginner'),
(2, 'Intermediate'),
(3, 'Expert'),
(4, 'References');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `TagForLink`
--
ALTER TABLE `TagForLink`
  ADD PRIMARY KEY (`TagID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `TagForLink`
--
ALTER TABLE `TagForLink`
  MODIFY `TagID` tinyint(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;


