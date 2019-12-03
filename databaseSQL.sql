/* initialize */
GO
USE DAU_CRAWLER
USE TEST
GO
SELECT * FROM 

/* create table */
create table Api(
	display_name nvarchar(255) NOT NULL,
	api_name nvarchar(255) NOT NULL,
	response int NOT NULL,
	parameter_type nvarchar(255) NOT NULL,
	url nvarchar(255) NOT NULL,
	response_text nvarchar(255),
	PRIMARY KEY (api_name)
)
/*
sp_help Parameter
ALTER TABLE Parameter
DROP CONSTRAINT PK__Paramete__F9C069AA475C8B58
ALTER TABLE Parameter
ADD CONSTRAINT ParameterPK PRIMARY KEY (api_name,parameter)
drop table Parameter
*/
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

/* SELECT TABLES */
GO
select * from Api;
select * from Parameter;
select * from Regexp;
select * from _Log;
select * from _Log ORDER BY _time DESC;

select * from Parameter where api_name='sedaeinfo'
insert into Api VALUES('결제금액 정보 조회', 'GetServicePayInfo2', 1, 'GetServicePayInfo2', '/GetServicePayInfo2', '안녕하세요')

update Api Set url = '/chatbot/rec/roombasic/get' where api_name = 'sedaeinfo'
/* WARINIG !!! */
/* DROP TABLES*/
/*
drop table Api;
drop table Parameter;
drop table Regexp;
drop table _Log;

delete  from Parameter where parameter = 'danconde'

*/
DELETE FROM Parameter WHERE display_name='종료년도'


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
