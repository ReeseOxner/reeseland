-- phpMyAdmin SQL Dump


-- --------------------------------------------------------

--
-- Table structure for table `LinkComment`
--

CREATE TABLE `LinkComment` (
  `LCID` tinyint(4) NOT NULL,
  `LinkID` smallint(6) NOT NULL,
  `Comment` text NOT NULL,
  `Date` date NOT NULL,
  `Display` tinyint(1) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


--
-- Indexes for table `LinkComment`
--
ALTER TABLE `LinkComment`
  ADD PRIMARY KEY (`LCID`);


--
-- AUTO_INCREMENT for table `LinkComment`
--
ALTER TABLE `LinkComment`
  MODIFY `LCID` tinyint(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;


