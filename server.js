//imports
const mongoose = require('mongoose');

const dotenv = require('dotenv').config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace('<password>', process.env.DB_PASSWORD);
console.log(DB);

mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then((con) => {
		console.log('connection successfully established');
	});

app.listen(process.env.PORT, () => {
	console.log('Server listening on port ' + process.env.PORT);
});
