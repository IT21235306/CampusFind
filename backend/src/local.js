const app = require('./index');
const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`CampusFind API listening on ${port}`));
