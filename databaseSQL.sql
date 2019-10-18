/* initialize */
GO
USE DAU_CRAWLER
GO
/* create table */
create table Api(
	display_name nvarchar(255) NOT NULL,
	api_name nvarchar(255) NOT NULL,
	response int NOT NULL,
	parameter_type nvarchar(255) NOT NULL,
	PRIMARY KEY (api_name)
)
create table Parameter(
	api_name nvarchar(255) NOT NULL,
	parameter nvarchar(255) NOT NULL,
	display_name nvarchar(255) NOT NULL,
	parameter_type nvarchar(255) NOT NULL,
	necessary int NOT NULL,
	PRIMARY KEY (parameter)
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
	_time int NOT NULL,
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

select * from Parameter where api_name='sedaeinfo'
update Parameter Set necessary = 1 where parameter_type = ''
/* WARINIG !!! */
/* DROP TABLES*/
/*
drop table Api;
drop table Parameter;
drop table Regexp;
drop table _Log;

delete  from Parameter where parameter = 'danconde'

*/


/* INSERT test data */
/* 1. API */
INSERT INTO Api VALUES('����������ȸ', 'sedaeinfo', 1, 'sedaeinfo')
INSERT INTO Api VALUES('�׽�Ʈ��', 'test', 1, 'testReg')
/* 2. parameter */
INSERT INTO Parameter VALUES('sedaeinfo', 'dancode', '�����ڵ�', 'dancode', 1)
INSERT INTO Parameter VALUES('sedaeinfo', 'dongcode', '��', 'dongcode', 1)
INSERT INTO Parameter VALUES('sedaeinfo', 'roomno', 'ȣ', 'roomno', 0)
INSERT INTO Parameter VALUES('sedaeinfo', 'relation', '����', 'relation', 0)
INSERT INTO Parameter VALUES('sedaeinfo', 'name', '�̸�', 'name', 0)
INSERT INTO Parameter VALUES('sedaeinfo', 'end_year', '����⵵', 'end_year', 0)
INSERT INTO Parameter VALUES('sedaeinfo', 'month', '��', 'month', 0)
INSERT INTO Parameter VALUES('sedaeinfo', 'start_year', '���۳⵵', 'start_year', 0)
INSERT INTO Parameter VALUES('sedaeinfo', 'year', '��', 'year', 0)
/* 3. Regexp */
INSERT INTO Regexp VALUES('dongcode', '^[0-9]{3}��', 'g', '', 0,3)
INSERT INTO Regexp VALUES('sedaeinfo', '��������', 'g', '', 0,3)
