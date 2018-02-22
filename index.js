const fs = require('fs');
const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
const express = require('express');
const promise = require('bluebird');
const formidable = require('formidable');
const http = require('http');
const https = require('https');
const util = require('util');
const app = express();

// Make our public directory visible to serve PDFs from
app.use(express.static('public'))

// Start the server
const server = app.listen(5000, () => {
    console.log('SVGtoPDF listening on port 5000');
});

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin,Content-Type,Authorization');

    next();
});

// Create a new HTTP server for handling uploads
app.post('/convert', (req, res) => {

    // Create the form object we can use to get values from
    const form = new formidable.IncomingForm()

    // Storage of our temp file
    let temp = '';

    // Once it begins we get the temp location
    form.on('fileBegin', function(name, file) {
        temp = file.path;
    });

    // Once the file has been uploaded completely
    form.on('end', function() {

        // Set up our output parameters
        var url = new Date().getTime();
        var doc = new PDFDocument();
        var stream = fs.createWriteStream('public/'+url+'.pdf');
        var data = fs.readFileSync(temp, 'utf8');
        var publicLocation = 'http://127.0.0.1:5000/'+url+'.pdf'

        // Create the PDF
        SVGtoPDF(doc, data, 0, 0);

        // Once it's done!
        stream.on('finish', function() {

            // Tell the user where it is
            return res.status(200).send({ url: publicLocation });
        });

        // SEND THE DATA
        doc.pipe(stream);
        doc.end();
    });

    // Parse it for the files
    form.parse(req, function(err, fields, files) {
        // Do nothing here. Just for show. Unless we want to do something
        // with parsing the file
    });

    return;
});
