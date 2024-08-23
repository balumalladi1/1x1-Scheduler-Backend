const db = require("../db");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

// User registration
const userRegister = async (req, res) => {
    const { name, email, password, role, area_of_interest } = req.body;

    try {
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: "Please provide all fields" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );

        if (role === 'mentor') {
            if (!area_of_interest) {
                return res.status(400).json({ success: false, message: "Please provide area_of_interest" });
            }
            await db.query(
                'INSERT INTO mentors (user_id, area_of_interest) VALUES (?, ?)',
                [result.insertId, area_of_interest]
            );
        }

        res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error", error });
    }
};

const userLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [row] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = row[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send token and role in response
        res.status(200).json({ token, role: user.role });

    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "Internal server error", error });
    }
};

// Fetch all mentors
const getMentors = async (req, res) => {
    try {
        const [mentors] = await db.query('SELECT * FROM mentors');
        res.json(mentors);
    } catch (error) {
        console.error('Failed to fetch mentors:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get bookings for mentors
const bookingMentor = async (req, res) => {
    if (req.user.role !== 'mentor') return res.sendStatus(403);

    try {
        const [bookings] = await db.query(
            `SELECT b.*, u.name AS student_name 
             FROM bookings b 
             JOIN users u ON b.student_id = u.id 
             WHERE b.mentor_id = ?`,
            [req.user.id]
        );

        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get bookings for students
const bookingstudent = async (req, res) => {
    if (req.user.role !== 'student') return res.sendStatus(403);

    try {
        const [bookings] = await db.query(
            `SELECT b.*, m.area_of_interest 
             FROM bookings b 
             JOIN mentors m ON b.mentor_id = m.user_id 
             WHERE b.student_id = ?`,
            [req.user.id]
        );

        console.log('Bookings:', bookings); // Debug log
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Handle payment
const payment = async (req, res) => {
    const { duration } = req.body;
    const payment = duration * 10;

    try {
        await db.query('UPDATE bookings SET payment = ?, status = "confirmed" WHERE student_id = ? AND mentor_id = ? AND status = "pending"', [
            payment,
            req.user.id,
            req.user.id,
        ]);

        res.json({ message: 'Payment processed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Book an appointment
const bookAppointment = async (req, res) => {
    const { mentor_id, start_time, end_time } = req.body;
    
    try {
        const userId = req.user.id;

        // Insert booking into the database
        await db.query(
            `INSERT INTO bookings (student_id, mentor_id, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)`,
            [userId, mentor_id, start_time, end_time, 'pending']
        );

        res.status(201).json({ success: true, message: 'Booking created successfully' });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = { userRegister, userLogin, getMentors, bookingMentor, bookingstudent, payment, bookAppointment };