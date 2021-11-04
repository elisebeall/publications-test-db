const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

const express = require('express');
const app = express();

// middleware
app.use(express.json());

app.set('port', process.env.PORT || 3000);
app.locals.title = 'Publications';

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});

app.get('/api/v1/papers', async (request, response) => {
  try {
    const papers = await database('papers').select();
    response.status(200).json(papers);
  } catch(error) {
    response.status(500).json({ error });
  }
});

app.get('/api/v1/footnotes', async (request, response) => {
  try {
    const footnotes = await database('footnotes').select();
    response.status(200).json(footnotes);
  } catch(error) {
    response.status(500).json({ error });
  }
});

app.get('/api/v1/papers/:id', async (request, response) => {
  try {
    const papers = await database('papers').where('id', request.params.id).select();
    if (papers.length) {
      response.status(200).json(papers);
    } else {
      response.status(404).json({
        error: `Could not find paper with id ${request.params.id}`
      });
    }
  } catch (error) {
    response.status(500).json({ error });
  }
});

app.post('/api/v1/papers', async (request, response) => {
  console.log(request.body);
  const paper = request.body;

  for (let requiredParameter of ['title', 'author']) {
    if (!paper[requiredParameter]) {
      return response
        .status(422)
        .send({ error: `Expected format: { title: <String>, author: <String> }. You're missing a "${requiredParameter}" property.` });
    }
  }

  try {
    const id = await database('papers').insert(paper, 'id');
    response.status(201).json({ id })
  } catch (error) {
    response.status(500).json({ error });
  }
});

app.post('/api/v1/footnotes', async (request, response) => {
  const footnote = request.body;

  for (let requiredParameter of ['note', 'paper_id']) {
    if (!footnote[requiredParameter]) {
      return response
        .status(422)
        .send({ error: `Expected format: { title: <String>, author: <String> }. You're missing a "${requiredParameter}" property.` });
    }
  }

  try {
    const id = await database('footnotes').insert(footnote, 'id');
    response.status(201).json({ id })
  } catch (error) {
    response.status(500).json({ error });
  }
});
