const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./userInsert');
const userLogin = require('./userLogin');
const settingsRoutes = require('./adminsetting');
const addSlotRoutes = require('./addslot');
const changePasswordRoutes = require('./changepassword');
const myBookingsRoutes = require('./mybookings');
const dashboardStatsRoutes = require('./dashboardstats');
const deleteSlotRoutes = require('./deleteslot');
const usersRoutes = require('./users');
const vehicleLogsRoutes = require('./vehicleLogs');
const bookslotRouter = require('./bookslot');
const db = require('./db');

// Mock the database execute and query functions
jest.mock('./db', () => ({
  execute: jest.fn(),
  query: jest.fn()
}));

// Setup express app for testing
const app = express();
app.use(bodyParser.json());
app.use('/api/user', userRoutes);
app.use('/api', userLogin);
app.use('/api', settingsRoutes);
app.use('/api', addSlotRoutes);
app.use('/api', changePasswordRoutes);
app.use('/api', myBookingsRoutes);
app.use('/api', dashboardStatsRoutes);
app.use('/api', deleteSlotRoutes);
app.use('/api', usersRoutes);
app.use('/api', vehicleLogsRoutes);
app.use('/', bookslotRouter);


//-----------------------------------------
// Your Previous Tests
//-----------------------------------------

describe('User Signup API Tests', () => {
  it('should successfully register a user with valid inputs', async () => {
    db.execute.mockResolvedValueOnce([[]]);

    const response = await request(app)
      .post('/api/user/signup')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password1!',
        role: 'user'
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User registered successfully!');
  });

  it('should return an error if email is already registered', async () => {
    db.execute.mockResolvedValueOnce([[{ email: 'test@example.com' }]]);

    const response = await request(app)
      .post('/api/user/signup')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password1!',
        role: 'user'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email is already registered!');
  });

  it('should return an error if any required field is missing', async () => {
    const response = await request(app)
      .post('/api/user/signup')
      .send({
        username: 'testuser',
        email: 'test@example.com'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All fields are required!');
  });

  it('should return an error if email format is invalid', async () => {
    const response = await request(app)
      .post('/api/user/signup')
      .send({
        username: 'testuser',
        email: 'invalid-email',
        password: 'Password1!',
        role: 'user'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid email format!');
  });

  it('should return an error if password does not meet the criteria', async () => {
    const response = await request(app)
      .post('/api/user/signup')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'short',
        role: 'user'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Password must be at least 7 characters long, include an uppercase letter, a lowercase letter, and a special character!'
    );
  });

  it('should return an error if the role is invalid', async () => {
    const response = await request(app)
      .post('/api/user/signup')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password1!',
        role: 'invalidRole'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid role!');
  });
});

describe('User Login API Tests', () => {
  it('should successfully log in a user with valid credentials', async () => {
    db.execute
      .mockResolvedValueOnce([[{ id: 1, email: 'test@example.com', password: 'Password1!' }]]);

    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'test@example.com',
        password: 'Password1!'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.user.role).toBe('user');
  });

  it('should fail login with incorrect password for user', async () => {
    db.execute
      .mockResolvedValueOnce([[{ id: 1, email: 'test@example.com', password: 'Password1!' }]]);

    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Incorrect password');
  });

  it('should successfully log in an admin with valid credentials', async () => {
    db.execute
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ id: 2, email: 'admin@example.com', password: 'AdminPass1!' }]]);

    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'admin@example.com',
        password: 'AdminPass1!'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.user.email).toBe('admin@example.com');
    expect(response.body.user.role).toBe('admin');
  });

  it('should fail login with incorrect password for admin', async () => {
    db.execute
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ id: 2, email: 'admin@example.com', password: 'AdminPass1!' }]]);

    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'admin@example.com',
        password: 'WrongAdminPass'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Incorrect password');
  });

  it('should return error if email and password are missing', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Email and password required');
  });

  it('should fail login if email not found in Users or Admins', async () => {
    db.execute
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[]]);

    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'SomePassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid email or password');
  });
});

//-----------------------------------------
// Admin Setting Tests (NEW)
//-----------------------------------------

describe('Admin Settings API Tests', () => {
  it('should update admin email successfully', async () => {
    db.execute.mockResolvedValueOnce([{}]);

    const response = await request(app)
      .post('/api/update-settings')
      .send({ adminEmail: 'newadmin@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Admin email updated successfully!');
  });

  it('should return an error when adminEmail is missing', async () => {
    const response = await request(app)
      .post('/api/update-settings')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Admin email is required.');
  });

  it('should return database error when update fails', async () => {
    db.execute.mockRejectedValueOnce(new Error('DB error'));

    const response = await request(app)
      .post('/api/update-settings')
      .send({ adminEmail: 'erroradmin@example.com' });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Database error.');
  });

  it('should fetch admin settings successfully', async () => {
    db.execute.mockResolvedValueOnce([[{ email: 'admin@example.com' }]]);

    const response = await request(app)
      .get('/api/settings');

    expect(response.status).toBe(200);
    expect(response.body.adminEmail).toBe('admin@example.com');
  });

  it('should return 404 if no admin is found', async () => {
    db.execute.mockResolvedValueOnce([[]]);

    const response = await request(app)
      .get('/api/settings');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Admin not found');
  });

  it('should return database error when fetching settings fails', async () => {
    db.execute.mockRejectedValueOnce(new Error('DB error'));

    const response = await request(app)
      .get('/api/settings');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Database error.');
  });
});


//-----------------------------------------
// NEW Tests for Add Slot
//-----------------------------------------
//-----------------------------------------
// NEW Tests for AddSlot GET APIs
//-----------------------------------------
describe('Slots Fetch API Tests', () => {
    it('should fetch slots with pagination successfully', async () => {
      db.execute
        .mockResolvedValueOnce([[{ count: 10 }]]) // for count query
        .mockResolvedValueOnce([[{ id: 1, slot_time: '9:00 AM' }, { id: 2, slot_time: '10:00 AM' }]]); // for slots query
  
      const response = await request(app)
        .get('/api/slots?page=1&size=2');
  
      expect(response.status).toBe(200);
      expect(response.body.slots.length).toBe(2);
      expect(response.body.totalPages).toBe(5);
      expect(response.body.currentPage).toBe(1);
    });
  
    it('should return database error while fetching paginated slots', async () => {
      db.execute.mockRejectedValueOnce(new Error('DB Error'));
  
      const response = await request(app)
        .get('/api/slots');
  
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Database error');
    });
  
    it('should fetch available slots successfully (my-slots)', async () => {
      db.execute.mockResolvedValueOnce([[{ id: 1, slot_time: '9:00 AM' }]]);
  
      const response = await request(app)
        .get('/api/my-slots');
  
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].slot_time).toBe('9:00 AM');
    });
  
    it('should return 404 if no slots are available (my-slots)', async () => {
      db.execute.mockResolvedValueOnce([[]]);
  
      const response = await request(app)
        .get('/api/my-slots');
  
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No slots available');
    });
  
    it('should return database error while fetching my-slots', async () => {
      db.execute.mockRejectedValueOnce(new Error('DB Error'));
  
      const response = await request(app)
        .get('/api/my-slots');
  
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Database error');
    });
  });
  


  //Password Change Tests
  describe('Change Password API Tests', () => {
    it('should change password successfully', async () => {
      db.execute
        .mockResolvedValueOnce([[{ password: 'oldpassword' }]]) // Mock fetch password
        .mockResolvedValueOnce([{}]); // Mock update password
  
      const response = await request(app)
        .post('/api/change-password')
        .send({ 
          email: 'test@example.com', 
          currentPassword: 'oldpassword', 
          newPassword: 'newpassword' 
        });
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password changed successfully!');
    });
  
    it('should fail if any field is missing', async () => {
      const response = await request(app)
        .post('/api/change-password')
        .send({ email: 'test@example.com' }); // missing currentPassword, newPassword
  
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Please fill in all fields');
    });
  
    it('should return error if user not found', async () => {
      db.execute.mockResolvedValueOnce([[]]);
  
      const response = await request(app)
        .post('/api/change-password')
        .send({ 
          email: 'notfound@example.com', 
          currentPassword: 'pass123', 
          newPassword: 'newpass123' 
        });
  
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found!');
    });
  
    it('should return error if current password is incorrect', async () => {
      db.execute.mockResolvedValueOnce([[{ password: 'correctpassword' }]]);
  
      const response = await request(app)
        .post('/api/change-password')
        .send({ 
          email: 'test@example.com', 
          currentPassword: 'wrongpassword', 
          newPassword: 'newpassword' 
        });
  
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Current password is incorrect');
    });
  
    it('should handle database errors', async () => {
      db.execute.mockRejectedValueOnce(new Error('DB Error'));
  
      const response = await request(app)
        .post('/api/change-password')
        .send({ 
          email: 'test@example.com', 
          currentPassword: 'pass123', 
          newPassword: 'newpass123' 
        });
  
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Database error');
    });
  });

  //-----------------------------------------
// NEW Tests for MyBookings
//-----------------------------------------

describe('My Bookings API Tests', () => {
  // Test: Fetch bookings by email successfully
  it('should fetch bookings for a user successfully', async () => {
    db.execute.mockResolvedValueOnce([[{
      id: 1,
      slot_time: '10:00 AM',
      booking_time: '2024-04-01 10:00:00'
    }]]);

    const response = await request(app)
      .get('/api/bookings?email=test@example.com');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].slot_time).toBe('10:00 AM');
  });

  // Test: Missing email in query
  it('should return error if email is missing in query', async () => {
    const response = await request(app)
      .get('/api/bookings');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email is required');
  });

  // Test: Database error while fetching bookings
  it('should handle database error while fetching bookings', async () => {
    db.execute.mockRejectedValueOnce(new Error('DB error'));

    const response = await request(app)
      .get('/api/bookings?email=test@example.com');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Database error');
  });

  // Test: Successfully cancel a booking
  it('should cancel a booking and update slot status', async () => {
    db.execute
      .mockResolvedValueOnce([[{ slot_id: 2 }]]) // Find slot_id for booking id
      .mockResolvedValueOnce([{}]) // Delete booking
      .mockResolvedValueOnce([{}]); // Update slot to available

    const response = await request(app)
      .delete('/api/bookings/1');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Booking canceled and slot updated to available');
  });

  // Test: Booking not found
  it('should return 404 if booking not found when deleting', async () => {
    db.execute.mockResolvedValueOnce([[]]); // No booking found

    const response = await request(app)
      .delete('/api/bookings/999');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Booking not found');
  });

  // Test: Database error while deleting booking
  it('should handle database error while cancelling booking', async () => {
    db.execute.mockRejectedValueOnce(new Error('DB error'));

    const response = await request(app)
      .delete('/api/bookings/1');

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Database error');
  });
});

//-----------------------------------------
// NEW Tests for Dashboard Stats
//-----------------------------------------

describe('Dashboard Stats API Tests', () => {

  it('should fetch dashboard stats successfully', async () => {
    db.query
      .mockResolvedValueOnce([[{ totalUsers: 100 }]])
      .mockResolvedValueOnce([[{ activeSlots: 20 }]])
      .mockResolvedValueOnce([[{ totalBookings: 10 }]]);

    const response = await request(app)
      .get('/api/dashboardStats');

    expect(response.status).toBe(200);
    expect(response.body.totalUsers).toBe(100);
    expect(response.body.activeSlots).toBe(20);
    expect(response.body.totalBookings).toBe(10);
    expect(response.body.utilization).toBe('50.00%');
  });

  it('should handle error in dashboardStats route', async () => {
    db.query.mockRejectedValueOnce(new Error('DB Error'));

    const response = await request(app)
      .get('/api/dashboardStats');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
  });

  it('should fetch chart stats successfully', async () => {
    db.query
      .mockResolvedValueOnce([[{ totalUsers: 100 }]])
      .mockResolvedValueOnce([[{ activeSlots: 20 }]])
      .mockResolvedValueOnce([[{ totalBookings: 10 }]])
      .mockResolvedValueOnce([[{ prevTotalUsers: 80 }]]);

    const response = await request(app)
      .get('/api/my-chartStats');

    expect(response.status).toBe(200);
    expect(response.body.totalUsers).toBe(100);
    expect(response.body.growthRate).toBe('25.00%');
    expect(response.body.completionRate).toBe('100.00%');
  });

  it('should handle error in my-chartStats route', async () => {
    db.query.mockRejectedValueOnce(new Error('DB Error'));

    const response = await request(app)
      .get('/api/my-chartStats');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
  });

  it('should fetch total users successfully', async () => {
    db.query.mockResolvedValueOnce([[{ totalUsers: 150 }]]);

    const response = await request(app)
      .get('/api/my-users');

    expect(response.status).toBe(200);
    expect(response.body.totalUsers).toBe(150);
  });

  it('should handle error when fetching users', async () => {
    db.query.mockRejectedValueOnce(new Error('DB Error'));

    const response = await request(app)
      .get('/api/my-users');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
  });

  //-----------------------------------------
  // User Activity Extended Tests
  //-----------------------------------------

  it('should fetch user activity (default month)', async () => {
    db.query.mockResolvedValueOnce([[{ label: '2024-04-01', count: 5 }]]);

    const response = await request(app)
      .get('/api/user-activity'); // No range passed, should default to month

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].label).toBe('2024-04-01');
  });

  it('should fetch user activity (week)', async () => {
    db.query.mockResolvedValueOnce([[{ label: '2024-04-15', count: 3 }]]);

    const response = await request(app)
      .get('/api/user-activity?range=week');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].label).toBe('2024-04-15');
  });

  it('should fetch user activity (quarter)', async () => {
    db.query.mockResolvedValueOnce([[{ label: '2024-03-01', count: 7 }]]);

    const response = await request(app)
      .get('/api/user-activity?range=quarter');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].label).toBe('2024-03-01');
  });

  it('should fetch user activity (year)', async () => {
    db.query.mockResolvedValueOnce([[{ label: '2024-01', count: 20 }]]);

    const response = await request(app)
      .get('/api/user-activity?range=year');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].label).toBe('2024-01');
  });

  it('should return error for invalid range in user-activity', async () => {
    const response = await request(app)
      .get('/api/user-activity?range=invalidRange');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid range');
  });

  it('should handle database error in user-activity route', async () => {
    db.query.mockRejectedValueOnce(new Error('DB Error'));

    const response = await request(app)
      .get('/api/user-activity?range=month');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
  });

});


//-----------------------------------------
// Delete Slot API Tests
//-----------------------------------------

describe('Delete Slot API Tests', () => {

  it('should successfully delete a slot and its bookings', async () => {
    db.execute
      .mockResolvedValueOnce([{}])  // Deleting from bookings
      .mockResolvedValueOnce([{ affectedRows: 1 }]);  // Deleting from slots

    const response = await request(app)
      .delete('/api/delete-slot/1');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Slot deleted successfully');
  });

  it('should return 404 if slot does not exist', async () => {
    db.execute
      .mockResolvedValueOnce([{}])  // Deleting from bookings
      .mockResolvedValueOnce([{ affectedRows: 0 }]);  // Slot not found

    const response = await request(app)
      .delete('/api/delete-slot/9999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Slot not found');
  });

  it('should return 500 if error occurs while deleting bookings', async () => {
    db.execute
      .mockRejectedValueOnce(new Error('DB error while deleting bookings'));

    const response = await request(app)
      .delete('/api/delete-slot/1');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
  });

  it('should return 500 if error occurs while deleting slot after booking deletion', async () => {
    db.execute
      .mockResolvedValueOnce([{}])  // Deleting bookings OK
      .mockRejectedValueOnce(new Error('DB error while deleting slot'));  // Error at deleting slot

    const response = await request(app)
      .delete('/api/delete-slot/1');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
  });

});

//-----------------------------------------
// Users API Tests
//-----------------------------------------
describe('Users API Tests', () => {
    // Test case 1: Successful fetch of users
    it('should fetch the list of users', async () => {
      const mockUsers = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' }
      ];
  
      db.execute.mockResolvedValueOnce([mockUsers]);
  
      const response = await request(app).get('/api/users');
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
    });
  
    // Test case 2: Database error when fetching users
    it('should return a 500 error if there is a database error', async () => {
      db.execute.mockRejectedValueOnce(new Error('Database connection failed'));
  
      const response = await request(app).get('/api/users');
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Database error' });
    });
  });


//BookSlot API Tests

describe('BookSlot API', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /book-slot', () => {

        it('should return 400 if userId or slotId is missing', async () => {
            const res = await request(app)
                .post('/book-slot')
                .send({ userId: 1 }); // slotId missing

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("User ID and Slot ID are required!");
        });

        it('should return 400 if slot is not available', async () => {
            db.query.mockImplementationOnce((sql, params, callback) => {
                callback(null, []); // No available slot
            });

            const res = await request(app)
                .post('/book-slot')
                .send({ userId: 1, slotId: 101 });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Slot not available or does not exist!");
        });

        it('should return 500 if database error during slot checking', async () => {
            db.query.mockImplementationOnce((sql, params, callback) => {
                callback(new Error('Database error'), null);
            });

            const res = await request(app)
                .post('/book-slot')
                .send({ userId: 1, slotId: 101 });

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe("Database error");
        });

        it('should book slot and update status successfully', async () => {
            // First query: check slot
            db.query
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, [{ id: 101, status: 'available' }]);
                })
                // Second query: insert into bookings
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, { insertId: 1 });
                })
                // Third query: update slot status
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, { affectedRows: 1 });
                });

            const res = await request(app)
                .post('/book-slot')
                .send({ userId: 1, slotId: 101 });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("Slot booked successfully!");
        });

        it('should return 500 if error during booking insertion', async () => {
            db.query
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, [{ id: 101, status: 'available' }]);
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error('Insert error'), null);
                });

            const res = await request(app)
                .post('/book-slot')
                .send({ userId: 1, slotId: 101 });

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe("Database error");
        });

        it('should return 500 if error during slot status update', async () => {
            db.query
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, [{ id: 101, status: 'available' }]);
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, { insertId: 1 });
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error('Update error'), null);
                });

            const res = await request(app)
                .post('/book-slot')
                .send({ userId: 1, slotId: 101 });

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe("Database error");
        });
    });

    describe('GET /available-slots', () => {

        it('should fetch available slots successfully', async () => {
            db.query.mockImplementationOnce((sql, callback) => {
                callback(null, [{ id: 101, status: 'available', slot_time: '10:00-11:00' }]);
            });

            const res = await request(app).get('/available-slots');

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].status).toBe('available');
        });

        it('should return 500 if database error on fetching available slots', async () => {
            db.query.mockImplementationOnce((sql, callback) => {
                callback(new Error('Database error'), null);
            });

            const res = await request(app).get('/available-slots');

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe("Database error");
        });
    });

    describe('GET /api/slots', () => {

        it('should return 500 if database error on /api/slots', async () => {
            db.query.mockImplementationOnce((sql, callback) => {
                callback(new Error('Database error'), null);
            });

            const res = await request(app).get('/api/slots');

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe("Database error");
        });
    });
});

describe('VehicleLogs API Tests', () => {
    //-----------------------------------
    // Vehicle Check-in Tests
    //-----------------------------------
    describe('POST /api/checkin', () => {
      it('should check in a vehicle successfully', async () => {
        const mockUser = [{ id: 1 }];
        const mockUserCheckIn = [];
        const mockVehicleCheckIn = [];
        const mockBooking = [{ booking_id: 10, slot_id: 5 }];
  
        db.execute
          .mockResolvedValueOnce([mockUser]) // Get user
          .mockResolvedValueOnce([mockUserCheckIn]) // No existing user check-in
          .mockResolvedValueOnce([mockVehicleCheckIn]) // No existing vehicle check-in
          .mockResolvedValueOnce([mockBooking]) // Valid booking
          .mockResolvedValueOnce([]) // Insert into VehicleLogs
          .mockResolvedValueOnce([]); // Update Slots
  
        const response = await request(app)
          .post('/api/checkin')
          .send({ user_email: 'test@example.com', vehicle_number: 'ABC123' });
  
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true, message: 'Check-in successful!' });
      });
  
      it('should return 400 if user_email or vehicle_number is missing', async () => {
        const response = await request(app)
          .post('/api/checkin')
          .send({ user_email: '', vehicle_number: '' });
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: "User email and vehicle number are required" });
      });
  
      it('should return 400 if user not found', async () => {
        db.execute.mockResolvedValueOnce([[]]); // No user found
  
        const response = await request(app)
          .post('/api/checkin')
          .send({ user_email: 'unknown@example.com', vehicle_number: 'ABC123' });
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'User not found' });
      });
  
      it('should return 400 if user already checked in', async () => {
        const mockUser = [{ id: 1 }];
        const mockUserCheckIn = [{}]; // Already checked in
  
        db.execute
          .mockResolvedValueOnce([mockUser])
          .mockResolvedValueOnce([mockUserCheckIn]); // Already checked in
  
        const response = await request(app)
          .post('/api/checkin')
          .send({ user_email: 'test@example.com', vehicle_number: 'XYZ123' });
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'You have already checked in with a vehicle' });
      });
  
      it('should return 400 if vehicle already checked in by another user', async () => {
        const mockUser = [{ id: 1 }];
        const mockUserCheckIn = [];
        const mockVehicleCheckIn = [{}]; // Vehicle already checked in
  
        db.execute
          .mockResolvedValueOnce([mockUser])
          .mockResolvedValueOnce([mockUserCheckIn])
          .mockResolvedValueOnce([mockVehicleCheckIn]); // Vehicle already checked in
  
        const response = await request(app)
          .post('/api/checkin')
          .send({ user_email: 'test@example.com', vehicle_number: 'XYZ123' });
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'This vehicle is already checked in by another user' });
      });
  
      it('should return 400 if no valid booking found', async () => {
        const mockUser = [{ id: 1 }];
        const mockUserCheckIn = [];
        const mockVehicleCheckIn = [];
        const mockBooking = [];
  
        db.execute
          .mockResolvedValueOnce([mockUser])
          .mockResolvedValueOnce([mockUserCheckIn])
          .mockResolvedValueOnce([mockVehicleCheckIn])
          .mockResolvedValueOnce([mockBooking]); // No booking
  
        const response = await request(app)
          .post('/api/checkin')
          .send({ user_email: 'test@example.com', vehicle_number: 'XYZ123' });
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'No valid booking found for check-in' });
      });
  
      it('should return 500 if database error occurs during check-in', async () => {
        db.execute.mockRejectedValue(new Error('Database error'));
  
        const response = await request(app)
          .post('/api/checkin')
          .send({ user_email: 'test@example.com', vehicle_number: 'XYZ123' });
  
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
      });
    });
  
    //-----------------------------------
    // Vehicle Check-out Tests
    //-----------------------------------
    describe('POST /api/checkout', () => {
      it('should check out a vehicle successfully', async () => {
        const mockCheckinRecord = [{
          id: 1,
          check_in_time: new Date(Date.now() - (1 * 60 * 60 * 1000)), // 1 hour ago
          slot_id: 5
        }];
  
        db.execute
          .mockResolvedValueOnce([mockCheckinRecord]) // Find active check-in
          .mockResolvedValueOnce([]) // Update VehicleLogs
          .mockResolvedValueOnce([]); // Update Slot status
  
        const response = await request(app)
          .post('/api/checkout')
          .send({ user_email: 'test@example.com', vehicle_number: 'ABC123' });
  
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Vehicle checked out successfully!');
        expect(response.body).toHaveProperty('duration');
        expect(response.body).toHaveProperty('total_fee');
      });
  
      it('should return 400 if user_email or vehicle_number is missing', async () => {
        const response = await request(app)
          .post('/api/checkout')
          .send({ user_email: '', vehicle_number: '' });
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: "User email and vehicle number are required" });
      });
  
      it('should return 400 if no active check-in record found', async () => {
        db.execute.mockResolvedValueOnce([[]]); // No active check-in record
  
        const response = await request(app)
          .post('/api/checkout')
          .send({ user_email: 'test@example.com', vehicle_number: 'XYZ123' });
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'No active check-in record found for this vehicle' });
      });
  
      it('should return 500 if database error occurs during checkout', async () => {
        db.execute.mockRejectedValue(new Error('Database error'));
  
        const response = await request(app)
          .post('/api/checkout')
          .send({ user_email: 'test@example.com', vehicle_number: 'XYZ123' });
  
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error during checkout' });
      });
    });
  });
  