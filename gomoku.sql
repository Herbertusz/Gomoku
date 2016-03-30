/*
SQLyog Ultimate v9.63
MySQL - 5.6.20 : Database - gomoku
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*Table structure for table `games` */

CREATE TABLE `games` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `grid_size_x` int(11) DEFAULT NULL,
  `grid_size_y` int(11) DEFAULT NULL,
  `connect_num` int(11) DEFAULT NULL,
  `player_num` int(11) DEFAULT NULL,
  `first_player_id` int(11) DEFAULT NULL,
  `winner_player_id` int(11) DEFAULT NULL,
  `winner_sequence` varchar(50) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `connected_player_num` int(11) DEFAULT NULL,
  `step_num` int(11) DEFAULT NULL,
  `time` int(11) DEFAULT NULL,
  `finished` tinyint(4) DEFAULT NULL,
  `requested` datetime DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

/*Data for the table `games` */

insert  into `games`(`id`,`grid_size_x`,`grid_size_y`,`connect_num`,`player_num`,`first_player_id`,`winner_player_id`,`winner_sequence`,`connected_player_num`,`step_num`,`time`,`finished`,`requested`,`created`) values (1,20,15,5,2,0,NULL,'',0,0,0,0,'2016-02-27 21:02:02','2016-02-27 21:02:02');
insert  into `games`(`id`,`grid_size_x`,`grid_size_y`,`connect_num`,`player_num`,`first_player_id`,`winner_player_id`,`winner_sequence`,`connected_player_num`,`step_num`,`time`,`finished`,`requested`,`created`) values (2,20,15,5,2,0,NULL,'',0,0,0,0,'2016-02-27 21:03:23','2016-02-27 21:03:23');
insert  into `games`(`id`,`grid_size_x`,`grid_size_y`,`connect_num`,`player_num`,`first_player_id`,`winner_player_id`,`winner_sequence`,`connected_player_num`,`step_num`,`time`,`finished`,`requested`,`created`) values (3,20,15,5,2,0,NULL,'',0,0,0,0,'2016-02-27 21:13:43','2016-02-27 21:13:43');

/*Table structure for table `highscore` */

CREATE TABLE `highscore` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `game_id` int(10) unsigned DEFAULT NULL,
  `player_id` varchar(50) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `name` varchar(300) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `winner` tinyint(4) DEFAULT NULL,
  `time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

/*Data for the table `highscore` */

/*Table structure for table `players` */

CREATE TABLE `players` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) DEFAULT NULL,
  `player_id` int(11) DEFAULT NULL COMMENT '0, 1, 2',
  `ai` varchar(50) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `stone` int(11) DEFAULT NULL COMMENT '0, 1, 2',
  `name` varchar(100) COLLATE utf8_hungarian_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

/*Data for the table `players` */

insert  into `players`(`id`,`game_id`,`player_id`,`ai`,`stone`,`name`) values (1,2,0,'human',0,'Hörb');
insert  into `players`(`id`,`game_id`,`player_id`,`ai`,`stone`,`name`) values (2,2,1,'random',1,'Gép');
insert  into `players`(`id`,`game_id`,`player_id`,`ai`,`stone`,`name`) values (3,3,0,'human',0,'Hörb');
insert  into `players`(`id`,`game_id`,`player_id`,`ai`,`stone`,`name`) values (4,3,1,'random',1,'Gép');

/*Table structure for table `steps` */

CREATE TABLE `steps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) DEFAULT NULL,
  `player_id` int(11) DEFAULT NULL,
  `field_id` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

/*Data for the table `steps` */

/*Table structure for table `streams` */

CREATE TABLE `streams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) DEFAULT NULL,
  `type` varchar(50) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `active` tinyint(4) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

/*Data for the table `streams` */

/*Table structure for table `users` */

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `password` varchar(100) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `active` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

/*Data for the table `users` */

insert  into `chat_users`(`id`,`username`,`password`,`email`,`created`,`active`) values (1,'Hörb','x','norb@webprog.biz','2015-12-17 19:19:37',1);
insert  into `chat_users`(`id`,`username`,`password`,`email`,`created`,`active`) values (2,'Pistike','x',NULL,'2015-12-17 19:19:51',0);
insert  into `chat_users`(`id`,`username`,`password`,`email`,`created`,`active`) values (3,'Dan','x',NULL,'2016-03-05 19:30:23',1);
insert  into `chat_users`(`id`,`username`,`password`,`email`,`created`,`active`) values (4,'Kristóf','x',NULL,'2016-03-09 21:12:22',1);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
