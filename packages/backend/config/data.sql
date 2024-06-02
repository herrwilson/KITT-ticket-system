-- INSERTS FOR TEST DB
-- Ticket table entries
INSERT INTO Ticket
  (title, completion_date, pick_up_date, additional_information, email, phone, status, indexInCol)
VALUES
  ('John Doe', NULL, NULL, 'PC won''t turn on', 'john.doe@example.com', '1234567890', 'todo', 0),
  ('Jane Smith', NULL, NULL, 'Printer not working', 'jane.smith@example.com', '0987654321', 'inProgress', 0),
  ('Alice Johnson', NULL, NULL, 'Software installation issue', 'alice.johnson@example.com', '5551234567', 'waitingCustomer', 0),
  ('Bob Brown', NULL, NULL, 'Internet connectivity problem', 'bob.brown@example.com', '9876543210', 'archive', 0),
  ('Sarah Lee', NULL, NULL, 'Monitor flickering', 'sarah.lee@example.com', '1239876543', 'todo', 1);

-- Device table entries
INSERT INTO Device
  (type, brand, model, password, problemDescription, ticketId)
VALUES
  ('Laptop', 'Dell', 'Latitude', 'password123', 'Screen cracked', 1),
  ('Printer', 'HP', 'OfficeJet Pro', 'letmein', 'Paper jamming', 1),
  ('Desktop', 'Lenovo', 'ThinkCentre', 'abc123', 'Not powering on', 3),
  ('Router', 'Linksys', 'WRT3200ACM', 'securepass', 'No internet connection', 4),
  ('Monitor', 'Samsung', 'S27R750QEN', 'password321', 'Display issues', 5);

-- Comment table entries
INSERT INTO Comment
  (creation_date, modified_date, message, ticketId)
VALUES
  (DATETIME('now'), DATETIME('now'), 'We will send a technician to check the issue.', 1),
  (DATETIME('now'), DATETIME('now'), 'Please try restarting the printer.', 2),
  (DATETIME('now'), DATETIME('now'), 'We will send you a replacement power supply.', 3),
  (DATETIME('now'), DATETIME('now'), 'Have you tried resetting the router?', 4),
  (DATETIME('now'), DATETIME('now'), 'We recommend updating your graphics driver.', 5);
