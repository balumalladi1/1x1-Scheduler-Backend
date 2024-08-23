
const mysql = require("mysql2/promise");

const mySqlpool = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"Balu@123",
    database: 'mentor_scheduler',
});


module.exports = mySqlpool



