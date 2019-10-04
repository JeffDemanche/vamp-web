const express = require('express'),
  app = express(),
  path = require('path')

const port = process.env.PORT || 4567

const viewPath = path.join(__dirname, '/view')

app.use(express.static(viewPath))
app.get('*', (req, res) => res.sendFile('./view/index.html', { root: __dirname }));

app.listen(port, () => console.log("App listening on port " + port))