Create DATABASE SE_Project;

USE SE_Project;

CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

ALTER TABLE Users
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
CREATE TABLE Admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE Slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot_time VARCHAR(50) NOT NULL UNIQUE, -- Example: '10:00 AM - 11:00 AM'
    status ENUM('available', 'booked') DEFAULT 'available'
);

CREATE TABLE Bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    slot_id INT NOT NULL,
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES Slots(id) ON DELETE CASCADE
);

INSERT INTO Slots (slot_time) VALUES 
('09:00 AM - 12:00 PM'),
('12:00 PM - 03:00 PM'),
('03:00 PM - 06:00 PM'),
('06:00 PM - 09:00 PM'),
('09:00 PM - 12:00 AM');

CREATE TABLE VehicleLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
	user_id INT NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL,
    check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    check_out_time DATETIME NULL,
    total_fee DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE (vehicle_number, check_out_time) 
);
Drop TABLE VehicleLogs;


INSERT INTO Users (username, email, password) 
VALUES ('testuser', 'test@example.com', 'testpassword');
ALTER TABLE Slots MODIFY COLUMN status ENUM('available', 'booked', 'used') DEFAULT 'available';

Select * from Users;

Select * from Slots;
Select * from Admins;
Select * from Bookings;
Select * from VehicleLogs;

Drop table Slots;
Drop table Bookings;
Drop table VehicleLogs;


Delete from slots where status = "booked";

CREATE TABLE UserBookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    slot_id INT NOT NULL,
    booking_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (slot_id) REFERENCES Slots(id)
);

Select * from Feedback;

CREATE TABLE Feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

ALTER TABLE Admins ADD COLUMN session_timeout INT DEFAULT 2;
Delete from Admins where id = 1
