/* initialize */
GO
USE DAU_CRAWLER
USE TEST
GO
use nj_master
select * from MSGUSER;
/* SELECT TABLES */
GO
select * from Api;
select * from Parameter;
select * from Regexp;
select * from _Log;
select * from Recommend
select * from Response
select * from _Log ORDER BY _time DESC;
UPDATE response SET flag='HOME', _option='', response_text='메인 페이지', _order='0', style='color:red;' WHERE flag='HOME' and _option='' and response_text='메인 페이지' and _order='0'
DELETE FROM response WHERE style is null

/* 작업 */
/*
SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Api'
update Api Set rest_method = 'post' where api_name = 'sedaeinfo'
update Api Set rest_method = 'get' where api_name = 'GetServicePayInfo2'
update Api Set url = '/GetServicePayInfo2/{dancode}/{dongcode}/{roomno}/{yyyymm}/{kind}/{rentgbn}' where api_name = 'GetServicePayInfo2'
select * from Parameter where api_name='sedaeinfo'
insert into Api VALUES('결제금액 정보 조회', 'GetServicePayInfo2', 1, 'GetServicePayInfo2', '/GetServicePayInfo2', '안녕하세요')
ALTER TABLE Api ADD rest_method nvarchar(100) sp_help Parameter
ALTER TABLE Response ADD style nvarchar(100) sp_help Parameter
ALTER TABLE Parameter ADD _order int null
ALTER TABLE Recommend ADD button nvarchar(10);
ALTER TABLE Recommend ADD idx int autoincreament;
ALTER TABLE Parameter DROP CONSTRAINT PK__Paramete__F9C069AA475C8B58
ALTER TABLE Regexp DROP COLUMN idx
ALTER TABLE Parameter ADD CONSTRAINT ParameterPK PRIMARY KEY (api_name,parameter)
drop table Parameter DELETE FROM Parameter WHERE display_name='종료년도'
*/

/* INSERT test data */
/* 1. API */
INSERT INTO Api VALUES('세대정보조회', 'sedaeinfo', 1, 'sedaeinfo', '/rec/roombasic/get', '안녕하세요')
INSERT INTO Api VALUES('테스트야', 'test', 1, 'testReg')
/* 2. parameter */
INSERT INTO Parameter VALUES('sedaeinfo', 'dancode', '단지코드', 'dancode', 1)
INSERT INTO Parameter VALUES('sedaeinfo', 'dongcode', '동', 'dongcode', 1)
INSERT INTO Parameter VALUES('sedaeinfo', 'roomno', '호', 'roomno', 1)
INSERT INTO Parameter VALUES('sedaeinfo', 'relation', '관계', 'relation', 0)
INSERT INTO Parameter VALUES('sedaeinfo', 'name', '이름', 'name', 0)
/* 3. Regexp */
INSERT INTO Regexp VALUES('dongcode', '^[0-9]{3}동', 'g', '', 0,3)
INSERT INTO Regexp VALUES('sedaeinfo', '세대정보', 'g', '', 0,3)
INSERT INTO Regexp VALUES('year', '[0-9]{3,4}년', 'g', '', 0,4)
INSERT INTO Regexp VALUES('year', '[0-9]{4}년', 'g', '', 0,4)
INSERT INTO Regexp VALUES('sedaeinfo', '세대정보', 'g', '', 0,3)

INSERT INTO Recommend VALUES('dongcode', '101동', -1)
INSERT INTO Recommend VALUES('dongcode', '102동', -1)
INSERT INTO Recommend VALUES('kind', '가스', -1)
INSERT INTO Recommend VALUES('kind', '관리비', -1)
INSERT INTO Recommend VALUES('kind', '임대', -1)
INSERT INTO Recommend VALUES('roomno', '세대정보', 'g', '', 0,3)
INSERT INTO Recommend VALUES('dancode', '세대정보', 'g', '', 0,3)

INSERT INTO Response VALUES('LOGIN', '', '안녕하세요~', 1)


/* WARINIG !!! */
/* DROP TABLES*/
/*
drop table Api;
drop table Parameter;
drop table Regexp;
drop table Recommend;
drop table _Log;
drop table Response
delete  from Parameter where parameter = 'danconde'

*/

/* create table */
create table Api(
	server nvarchar(100) NOT NULL,
	display_name nvarchar(100) NOT NULL,
	api_name nvarchar(100) NOT NULL,
	parameter_type nvarchar(100) NOT NULL,
	url nvarchar(100) NOT NULL,
	response_text nvarchar(100),
	response int NOT NULL,
	rest_method nvarchar(10) NOT NULL,
	show nvarchar(10) NOT NULL,
	PRIMARY KEY (server, api_name)
)

create table Parameter(
	api_name nvarchar(200) NOT NULL,
	parameter nvarchar(200) NOT NULL,
	display_name nvarchar(255) NOT NULL,
	parameter_type nvarchar(255) NOT NULL,
	necessary int NOT NULL,
	PRIMARY KEY (api_name, parameter)
)
create table Regexp(
	idx INT NOT NULL identity,
	parameter_type nvarchar(200) NOT NULL,
	regexp nvarchar(200) NOT NULL,
	_option nvarchar(255),
	return_value nvarchar(255),
	start int,
	_length int,
	PRIMARY KEY (parameter_type, regexp)
)
create table _Log(
	_time nvarchar(200) NOT NULL,
	dancode nvarchar(100) NOT NULL,
	id nvarchar(100) NOT NULL,
	query nvarchar(255) NOT NULL
)
create table Recommend(
	idx int not null IDENTITY,
	parameter_type nvarchar(200) NOT NULL,
	word nvarchar(200) NOT NULL,
	button nvarchar(10) NOT NULL,
	PRIMARY KEY (parameter_type, word)
)
create table Response(
	flag nvarchar(100) NOT NULL,
	_option nvarchar(100) NOT NULL,
	response_text nvarchar(200) NOT NULL,
	_order int NOT NULL,
	PRIMARY KEY (flag, _option, _order) 
)