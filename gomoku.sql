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
/*Table structure for table `chat_messages` */

CREATE TABLE `chat_messages` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned DEFAULT NULL,
  `room` varchar(50) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `message` text COLLATE utf8_hungarian_ci,
  `created` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

/*Data for the table `chat_messages` */

insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (10,1,'room-1-1458418060942','Na mi van?','2016-03-19 21:07:47');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (11,3,'room-1-1458418060942','Semmi','2016-03-19 21:07:51');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (12,1,'room-1-1458418060942','As was foretold, Amon, the Dark God, lives again. If any hope remains for our galaxy, it lies in the hands of the xel\'naga.','2016-03-19 21:08:38');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (16,2,'room-3-1458420620270','Mi ez az egész?','2016-03-19 21:50:31');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (17,1,'room-3-1458420620270','Ez motherfucking websocket, pistike!','2016-03-19 21:50:54');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (18,3,'room-3-1458420620270','Pistikéket ijeszgetsz?','2016-03-19 21:51:20');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (20,1,'room-1-1458470680661','@include cross(20px, 20px, 4px, 7px, 2px, #f5f5f5);\n				margin: 5px;\n				float: right;\n				cursor: pointer;\n\n				&:hover::before {\n					background-color: #ff0000;\n				}\n				&:hover::after {\n					background-color: #ff0000;\n				}','2016-03-20 11:48:15');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (21,1,'room-1-1458470680661','huppsz','2016-03-20 11:48:22');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (22,3,'room-1-1458470680661','Ez mi?','2016-03-20 11:48:26');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (23,1,'room-1-1458470680661','na a sass-expert nem ismeri fel ha sass-t lát :D','2016-03-20 11:48:43');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (24,3,'room-1-1458470680661','áááááá','2016-03-20 11:48:55');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (66,1,'room-1-1459180786761','Amon did not view himself or his actions as evil. He believed that the Infinite Cycle brought unnecessary suffering and was corrupt. He often claimed to his followers and foes alike that by destroying the creations of the xel\'naga, he was bringing an end to their suffering. According to Rohana, however, Amon actually desired to destroy life out of an intense hatred for the xel\'naga.[12] There is evidence that Amon\'s resentment towards the xel\'naga and the Infinite Cycle is in part due to his transformation into a xel\'naga himself, a process which Amon claimed was forced on him.[9]','2016-03-28 17:59:55');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (67,1,'room-1-1459364189908','fsdggdf','2016-03-30 20:56:38');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (68,3,'room-1-1459364189908','gdf','2016-03-30 20:56:41');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (69,1,'room-1-1459364758403','sdfsdf','2016-03-30 21:06:06');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (70,3,'room-1-1459364758403','sdf','2016-03-30 21:06:10');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (71,3,'room-1-1459365095268','dasas','2016-03-30 21:11:46');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (72,1,'room-1-1459365095268','sdfsdf','2016-03-30 21:11:51');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (73,3,'room-1-1459365954597','dfdf','2016-03-30 21:26:04');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (74,1,'room-1-1459365954597','dfgfdgdf','2016-03-30 21:26:07');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (75,1,'room-1-1459365954597','sdfdsfsd','2016-03-30 21:26:16');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (76,3,'room-1-1459365954597','xxxx','2016-03-30 21:26:19');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (77,1,'room-1-1459365954597','sdfsdf','2016-03-30 21:26:33');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (78,4,'room-1-1459366005989','Na','2016-03-30 21:27:37');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (79,1,'room-1-1459366005989','Mi na?','2016-03-30 21:27:41');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (80,3,'room-1-1459366005989','Pina','2016-03-30 21:27:50');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (81,1,'room-1-1459368547633','dfg','2016-03-30 22:09:11');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (82,1,'room-1-1459368616842','ddfs','2016-03-30 22:10:20');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (83,1,'room-1-1459368722012','gdfgdf','2016-03-30 22:12:05');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (84,1,'room-1-1459368857353','x','2016-03-30 22:14:25');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (85,3,'room-1-1459368857353','dfgdf','2016-03-30 22:15:22');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (86,1,'room-1-1459369089713','sdfsdf','2016-03-30 22:18:16');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (87,1,'room-1-1459369178313','sdfsdffsd','2016-03-30 22:19:41');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (88,4,'room-1-1459369314152','dfsdfs','2016-03-30 22:22:20');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (89,1,'room-1-1459369534517','x','2016-03-30 22:25:39');
insert  into `chat_messages`(`id`,`user_id`,`room`,`message`,`created`) values (90,3,'room-1-1459370635698','gju','2016-03-30 22:44:11');

/*Table structure for table `chat_users` */

CREATE TABLE `chat_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `password` varchar(100) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `active` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

/*Data for the table `chat_users` */

insert  into `chat_users`(`id`,`username`,`password`,`email`,`created`,`active`) values (1,'Hörb','x','norb@webprog.biz','2015-12-17 19:19:37',1);
insert  into `chat_users`(`id`,`username`,`password`,`email`,`created`,`active`) values (2,'Pistike','x',NULL,'2015-12-17 19:19:51',1);
insert  into `chat_users`(`id`,`username`,`password`,`email`,`created`,`active`) values (3,'Dan','x',NULL,'2016-03-05 19:30:23',1);
insert  into `chat_users`(`id`,`username`,`password`,`email`,`created`,`active`) values (4,'Kristóf','x',NULL,'2016-03-09 21:12:22',1);
insert  into `chat_users`(`id`,`username`,`password`,`email`,`created`,`active`) values (5,'Richi','x',NULL,'2016-03-15 18:15:23',1);

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

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
