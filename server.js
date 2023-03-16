const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');


dotenv.config({ path: './config.env' });

// const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_USERNAME).replace('<USERNAME>', process.env.DATABASE_PASSWORD);

const DB = process.env.DATABASE;
console.log(DB);
mongoose.connect(DB, {
    useNewUrlParser: true
}).then(con => {
    console.log('Database connected');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on prot ${port} ...`);
})