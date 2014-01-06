CREATE TABLE IF NOT EXISTS `score_sudoku` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `playername` text NOT NULL,
  `time` mediumint(8) unsigned NOT NULL,
  `address` varchar(15) CHARACTER SET latin1 NOT NULL,
  `referer` text CHARACTER SET latin1 NOT NULL,
  `givens` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;
