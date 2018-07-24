// import your node modules

const db = require('./data/db.js');
const express = require('express');
const cors = require('cors');
//const bodyParser = require('body-parser');

const server = express();

const sendUserError = (status, errorMessage, res) => {
  res.status(status).json({errorMessage: errorMessage});
}

server.use(express.json());
//server.use(bodyParser.json());
server.use(cors());
// add your server code starting here
server.get('/api/posts', async (req, res) => {
  try {
      const posts = await db.find();
      res.status(200).json(posts);
  } catch(err) {
    res.status(500).json({errorMessage: "The posts could not be retrieved", err: err});
  }
}); //Here I have used async/await syntax just to try it out.

server.get('/api/posts/:id', async (req, res) => {
try {
const post = await db.fondById(req.params.id);
  if (post.length > 0) {
    res.status(200).json(post);
  } else {
    sendUserError(404, "The post with the specified ID does not exist.", res);
  }
} catch(err) {
  sendUserError(500, `Server Error: ${err}`, res);
}
});

server.post('/api/posts/', (req, res) => {
  const {title, contents} = req.body;
  if (!(title && contents)) {
    sendUserError(400, "Please provide title and contents for the post.", res);
    return;
  }

  db.insert({title, contents}).then(response => {
    db.findById(response.id).then(response => {
      res.status(201).json(response);
    }).catch(err => {
      sendUserError(500, "The post with the specified ID does not exist.", res);
    })
  }).catch(err => {
    sendUserError(500, "There was an error while saving the post to the database", res);
  })
});

server.delete('/api/posts/:id', (req, res) => {
  db.remove(req.params.id).then(response => {
    console.log('resfafw', response);
    if (response === 0) {
      sendUserError(404, "The post with the specified ID does not exist.", res);
    }
      res.status(200).json(response);

  }).catch(err => {
    sendUserError(500, err, res);
  })
})

server.put('/api/posts/:id', (req, res) => {
  const {title, contents} = req.body;
  if (!(title && contents)) {
    sendUserError(400, "Please provide title and contents for the post.", res);
  }
  db.update(req.params.id, {title, contents}).then(response => {
    if (response === 0) {
      sendUserError(404, "The post with the specified ID does not exist.", res);
    }
    db.findById(req.params.id).then(response => {
      res.status(200).json(response)
    })
  }).catch(err => {
    sendUserError(500, "The post could not be removed", res)
  })
});

server.listen(8000, () => console.log('App is listening...'));
