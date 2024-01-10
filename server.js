const path = require('path');
const mysql = require('mysql2'); 
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs') ;
const app = express();



// Create a MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 1000,
    host: 'localhost',
    user: 'root',
    password: 'Zizo0909',
    database: 'site'
});

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth.html'));
});


app.get('/company_page', (req, res) => {
    // Extract the id from the query parameters
    const companyId = req.query.id;

    if (!companyId) {
        // Handle the case where id is missing
        return res.status(400).json({ error: 'Company id is required' });
    }

    // Get a connection from the pool
    pool.getConnection((getConnectionErr, connection) => {
        if (getConnectionErr) {
            console.error('Error getting MySQL connection:', getConnectionErr);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Query the database to get company information based on id
        connection.query('SELECT * FROM company WHERE id = ?', [companyId], (companyQueryErr, companyResults) => {
            // Release the connection back to the pool
            connection.release();

            if (companyQueryErr) {
                console.error('Error querying company from database:', companyQueryErr);
                res.status(500).json({ error: 'Internal server error', details: companyQueryErr.message });
            } else {
                const company = companyResults[0]; // Assuming you want to access the first result

                if (company) {
                    // Query the database to get job information based on company id
                    connection.query('SELECT * FROM jobs WHERE id_company = ?', [companyId], (jobQueryErr, jobResults) => {
                        if (jobQueryErr) {
                            console.error('Error querying jobs from database:', jobQueryErr);
                            res.status(500).json({ error: 'Internal server error', details: jobQueryErr.message });
                        } else {
                            // Read the content of company_page.html and send it with job information
                            const filePath = path.join(__dirname, 'company-page.html');
                            
                        // Dynamically generate table rows based on job information
                        const tableRows = jobResults.map(job => {
                            return '<tr>' +
                                '<td>' + job.job_description + '</td>' +
                                '<td class="skills">' + JSON.stringify(job.skills) + '</td>' +
                                '<td>' + job.location + '</td>' +
                                '<td><button id="aa' + job.id + '" class="delete">delete</button></td>' +
                                '</tr>';
                        }).join('');

                            fs.readFile(filePath, 'utf8', (fileReadErr, fileContent) => {
                                if (fileReadErr) {
                                    console.error('Error reading company_page.html:', fileReadErr);
                                    res.status(500).json({ error: 'Internal server error', details: fileReadErr.message });
                                } else {
                                    // Replace the placeholder with the dynamically generated table rows
                                    const renderedHTML = fileContent.replace('<!-- Job information will be dynamically inserted here -->', tableRows);
                                    res.send(renderedHTML);
                                }
                            });
                        }
                    });
                } else {
                    // Handle the case where the company with the given id is not found
                    res.status(404).send('Company not found');
                }
            }
        });
    });
});






app.get('/jobs', async (req, res) => {
    let connection;

    try {
        const keyword = req.query.keyword;

        if (!keyword) {
            return res.status(400).json({ error: 'Keyword parameter is required' });
        }

        // Get a connection from the pool
        pool.getConnection((getConnectionErr, conn) => {
            if (getConnectionErr) {
                console.error('Error getting MySQL connection:', getConnectionErr);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            connection = conn;
            // Use the connection for querying
            connection.execute(
                'SELECT * FROM jobs WHERE job_description LIKE ? OR JSON_KEYS(skills) LIKE ?',
                [`%${keyword}%`, `%"${keyword}"%`],
                (queryErr, results) => {
                    if (queryErr) {
                        console.error('Error querying database:', queryErr);
                        res.status(500).json({ error: 'Internal server error', details: queryErr.message });
                    } else {
                        // Send the results to the client
                        res.json(results);
                        console.log(results.length);
                        console.log(results, "from server html");
                        console.log('Data sent to the client');
                    }

                    // Release the connection back to the pool
                    connection.release();
                }
            );
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });

        // Ensure that the connection is released in case of an error
        if (connection) {
            connection.release();
        }
    }
});


app.get('/company_name_email', (req, res) => {
    const number = req.query.number;
    pool.getConnection((err, conn) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        connection = conn;
        connection.execute(
            'SELECT c.name, e.email FROM company c JOIN emails e ON c.id = e.id_company WHERE c.id = ?',
            [number],
            (queryErr, results) => {
                if (queryErr) {
                    console.error('Error querying database:', queryErr);
                    res.status(500).json({ error: 'Internal server error', details: queryErr.message });
                } else {
                    res.json(results[0]);
                    console.log(results.length);
                    console.log(results, "from server html");
                    console.log('Data sent to the client');
                }

                // Release the connection back to the pool
                connection.release();
            }
        );
    });
});


app.post('/form', (req, res) => {
    // Access form data from the request body
    const { id, password } = req.body;

    // Get a connection from the pool
    pool.getConnection((getConnectionErr, connection) => {
        if (getConnectionErr) {
            console.error('Error getting MySQL connection:', getConnectionErr);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Query the database to check if the credentials are correct
        connection.query('SELECT * FROM company WHERE id = ? AND password = ?', [id, password], (queryErr, results) => {
            // Release the connection back to the pool
            connection.release();

            if (queryErr) {
                console.error('Error querying database:', queryErr);
                res.status(500).json({ error: 'Internal server error', details: queryErr.message });
            } else {
                const user = results[0]; // Assuming you want to access the first result

                if (user) {
                    console.log(user.name);
                    // Credentials are correct, redirect to /company_page with query parameters
                    res.redirect(`/company_page?id=${user.id}`);
                } else {
                    // Credentials are incorrect, send an error message
                    res.send('Invalid id or password. Please try again.');
                }
            }
        });
    });
});



// Change the server code to handle GET requests for job deletion
app.get('/delete_job', (req, res) => {
    const jobId = req.query.id;

    if (!jobId) {
        console.log("Job ID is missing");
        return res.status(400).json({ error: 'Job ID is required' });
    }

    // Get a connection from the pool
    pool.getConnection((getConnectionErr, connection) => {
        if (getConnectionErr) {
            console.error('Error getting MySQL connection:', getConnectionErr);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Perform the deletion in your database based on the jobId
        connection.query('DELETE FROM jobs WHERE id = ?', [jobId], (deleteErr, results) => {
            // Release the connection back to the pool
            connection.release();

            if (deleteErr) {
                console.error('Error deleting job from database:', deleteErr);
                res.status(500).json({ error: 'Internal server error', details: deleteErr.message });
            } else {
                console.log('Job deleted successfully');
                res.json({ message: 'Job deleted successfully' });
            }
        });
    });
});


app.get('/check_credentials', (req, res) => {
    // Access form data from the request body
    const { id, password } = req.query;

    // Get a connection from the pool
    pool.getConnection((getConnectionErr, connection) => {
        if (getConnectionErr) {
            console.error('Error getting MySQL connection:', getConnectionErr);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Perform the query to check credentials
        connection.query(
            'SELECT * FROM company WHERE id = ? AND password = ?',
            [id, password],
            (queryErr, results) => {
                // Release the connection back to the pool
                connection.release();

                if (queryErr) {
                    console.error('Error querying database:', queryErr);
                    res.status(500).json({ error: 'Internal server error', details: queryErr.message });
                } else {
                    const isValidCredentials = results.length > 0;
                    console.log(isValidCredentials) ;

                    if (isValidCredentials) {
                        res.json({ valid: true });
                    } else {
                        res.json({ valid: false });
                    }
                }
            }
        );
    });
});



// Change the server code to handle GET requests for adding a job
app.get('/add_job', (req, res) => {
    // Access query parameters from the request
    const { id, jobDescription, location, skills } = req.query;

    console.log(skills);

    // Get a connection from the pool
    pool.getConnection((getConnectionErr, connection) => {
        if (getConnectionErr) {
            console.error('Error getting MySQL connection:', getConnectionErr);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Perform the insertion into the jobs table
        connection.query(
            'INSERT INTO jobs (job_description, skills, id_company, location) VALUES (?, ?, ?, ?)',
            [jobDescription, JSON.stringify(JSON.parse(skills)), id, location],
            (insertErr, results) => {
                // Release the connection back to the pool
                connection.release();

                if (insertErr) {
                    console.error('Error inserting job into the database:', insertErr);
                    res.status(500).json({ error: 'Internal server error', details: insertErr.message });
                } else {
                    console.log('Job inserted successfully');
                    res.json({ message: 'Job added successfully' });
                }
            }
        );
    });
});








app.listen(3000, () => {
    console.log('The server is actually listening on port 3000');
});