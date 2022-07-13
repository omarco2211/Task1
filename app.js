require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser")
const mysql = require("mysql");
const app = express();

const port = process.env.port || 3000


app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static("public"));

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
});



app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});


app.route("/view-all")
    .get((req, res) => {
        pool.getConnection((err, conn) => {
            if (err) throw err;
            conn.query('SELECT * FROM client', (err, rows) => {
                conn.release(); // release the connection
                if (!err) {
                    console.log(rows);
                    res.render("view-all", {
                        rows: rows
                    });
                } else {
                    throw err;
                }
            })
        })
    })
    .post((req, res) => {
        console.log(req.body);
        pool.getConnection((err, conn) => {
            if (err) throw err;
            var new_amnt = Number(req.body.balance) - Number(req.body.amount);
            conn.query('Select * from client where accountid = ?', [req.body.transferid], (err, rows) => {
                if (err) throw err;
                else {
                    if (rows.length === 0) {
                        res.status(400).json({
                            status: 400,
                            message: "invalid account id",
                            err: "account"
                        })
                    } else if (new_amnt < 0) {
                        res.status(400).json({
                            status: 400,
                            message: "insufficient balance",
                            err: "balance"
                        })
                    } else {
                        conn.query('update client set balance = ? where accountid = ?', [new_amnt, req.body.id]);
                        conn.query('update client set balance = balance+? where accountid = ?', [req.body.amount, req.body.transferid]);
                        const params = {
                          sourceid: req.body.id,
                          sinkid: req.body.transferid,
                          amount: req.body.amount
                        };
                        conn.query('Insert into transfers set ?', params);
                        conn.release();
                        req.body.balance = new_amnt;
                        res.status(200).json({
                            status: 200,
                            message: "transfer succeeded",
                            err: "",
                            body: req.body
                        })
                    }

                }
            })
        })

    })
    .put((req, res) => {
        pool.getConnection((err, conn) => {
            if (err) throw err;
            else {
                console.log(req.body.id);
                conn.query("Select * from client where accountid = ?", [req.body.id], (err, rows) => {
                    if (err) throw err;
                    else {
                        rows[0]["err"] = false;
                        console.log(rows[0]);
                        res.status(200).json(rows[0]);
                    }
                })
            }
        })
    })




app.listen(port, () => {
    console.log("Server Started Started");
});
