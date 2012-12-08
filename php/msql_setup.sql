CREATE DATABASE 'reergymerej_timecard';

CREATE TABLE 'task' (
  'id' int(11) NOT NULL AUTO_INCREMENT,
  'start' bigint(20) NOT NULL,
  'end' bigint(20) NOT NULL,
  'duration' bigint(20) NOT NULL,
  'category_id' bigint(20) DEFAULT NULL,
  'user_id' bigint(20) NOT NULL,
  'category' varchar(45) NOT NULL,
  PRIMARY KEY ('id')
) ENGINE=InnoDB AUTO_INCREMENT=0;