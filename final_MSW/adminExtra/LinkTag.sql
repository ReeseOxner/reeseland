-- phpMyAdmin SQL Dump

-- --------------------------------------------------------

--
-- Table structure for table `LinkTag`
--

CREATE TABLE `LinkTag` (
  `LTID` smallint(6) NOT NULL,
  `LinkID` smallint(6) NOT NULL,
  `TagID` tinyint(4) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;



--
-- Indexes for table `LinkTag`
--
ALTER TABLE `LinkTag`
  ADD PRIMARY KEY (`LTID`);


--
-- AUTO_INCREMENT for table `LinkTag`
--
ALTER TABLE `LinkTag`
  MODIFY `LTID` smallint(6) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;
COMMIT;

