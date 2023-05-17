use sys;

-- DROP TABLE Session;
CREATE TABLE Session(
	id char(36) NOT NULL,
	pubKey varbinary(1024) NOT NULL,
    PRIMARY KEY (id)
);

-- DROP TABLE SessionCandidate;
CREATE TABLE SessionCandidate(
	message varbinary(1024) NOT NULL,
    cName varchar(100) NOT NULL,
    sessionId char(36) NOT NULL,
    PRIMARY KEY (message, sessionId),
    FOREIGN KEY (sessionId) REFERENCES Session(id)
);

-- drop table SessionVote;
create table SessionVote(
	sessionId char(36) NOT NULL,
    vote varbinary(4096) NOT NULL,
    y0 varbinary(1024) NOT NULL,
    s varbinary(1024) NOT NULL,
    groupId char(36) NOT NULL,
	PRIMARY KEY (y0),
    FOREIGN KEY (sessionId) REFERENCES Session(id)
);

-- drop table SignatureC;
create table SignatureC(
	y0 varbinary(1024) NOT NULL,
	c varbinary(1024) NOT NULL,
    idx int NOT NULL,
    FOREIGN KEY (y0) REFERENCES SessionVote(y0)
);

-- drop table Voter;
create table Voter(
	pubKey varbinary(1024) NOT NULL UNIQUE,
    groupId char(36) NOT NULL,
    idx int NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (pubKey),
    KEY (idx)
);
