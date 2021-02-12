const express = require('express');
const fileupload = require('express-fileupload');

const app = express();

app.use(fileupload());

//Upload Endpoint
// req = requirements
// res = response
app.post('/upload', (req, res) => {
    if(req.files === null){
        return res.status(400).json({ msg: 'No file uploaded'});
    }

    const file = req.files.file;

    //move file to specific path
    file.mv(`${__dirname}/client/public/uploads/${file.name}`, err => {
        if(err){
            console.error(err);
            return res.status(500).send(err);
        }

        //if no error, send response to json
        res.json({fileName: file.name, filePath: `/uploads/${file.name}`});
    })
});

app.listen(5000, () => console.log('Server Started...'));