CREATE TABLE IF NOT EXISTS Ticket
(
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(32) NOT NULL,
  creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completion_date DATETIME,
  pick_up_date DATETIME,
  additional_information VARCHAR(255),
  email VARCHAR(32) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT "todo",
  isDoneOnSite INTEGER NOT NULL DEFAULT 0,
  isSuccess INTEGER NOT NULL DEFAULT 0,
  indexInCol INTEGER NOT NULL
);

-- create a trigger for automatically updating the modified date when another field changes 
CREATE TRIGGER IF NOT EXISTS Ticket_trig
AFTER UPDATE OF
  id,
  title,
  completion_date,
  pick_up_date,
  additionalInformation,
  email,
  phone,
  status,
  isDoneOnSite, isSuccess, indexInCol
  ON Ticket
FOR EACH ROW BEGIN UPDATE Ticket
SET modified_date = DATETIME('now')
WHERE rowid = new.rowid; END;

CREATE TABLE IF NOT EXISTS Device
(
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  type VARCHAR(32) NOT NULL,
  brand VARCHAR(32),
  model VARCHAR(32),
  password VARCHAR(255),
  problemDescription VARCHAR(255) NOT NULL,
  ticketId INTEGER NOT NULL,
  FOREIGN KEY (ticketId) REFERENCES Ticket(id)
);

CREATE TABLE IF NOT EXISTS Comment
(
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  creation_date DATETIME NOT NULL,
  modified_date DATETIME NOT NULL,
  message VARCHAR(255) NOT NULL,
  ticketId INTEGER NOT NULL,
  FOREIGN KEY (ticketId) REFERENCES Ticket(id)
);
