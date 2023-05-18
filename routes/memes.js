import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { createReadStream } from 'fs';
import path from 'path';
import fs from 'fs';
import mime from 'mime';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import Meme from '../models/Meme.js';
import User from '../models/User.js';

const router = express.Router();
router.use(cors());


//meme functionality
router.get('/', async (request, response) => {
  try {
    const createdMemes = await Meme.find();

    const options = {
      method: 'GET',
      url: 'https://memes9.p.rapidapi.com/api/list',
      params: {
        genre: 'memes',
        type: 'top'
      },
      headers: {
        'X-RapidAPI-Key': '42bd03362fmsh7ee79efbd932244p1882b0jsn4e9f86f6861a',
        'X-RapidAPI-Host': 'memes9.p.rapidapi.com'
      }
    };

    const responseAPI = await axios.request(options);
    const externalAPIMemes = responseAPI.data.memes_list;
    console.log(externalAPIMemes);

    if (!Array.isArray(externalAPIMemes)) {
      throw new Error('External API response is not iterable');
    }

    const allMemes = [...externalAPIMemes, ...createdMemes];

    response.json(allMemes);
  } catch (err) {
    console.error(err);
  }
});

router.get('/region', async (request, response) => {
  try {
    const { country } = request.query;
    const query = {};

    if (country) {
      query.regionalContent = country;
    }

    const createdMemes = await Meme.find(query);

    const options = {
      method: 'GET',
      url: 'https://memes9.p.rapidapi.com/api/list',
      params: {
        genre: 'memes',
        type: 'top'
      },
      headers: {
        'X-RapidAPI-Key': '42bd03362fmsh7ee79efbd932244p1882b0jsn4e9f86f6861a',
        'X-RapidAPI-Host': 'memes9.p.rapidapi.com'
      }
    };

    const responseAPI = await axios.request(options);
    const externalAPIMemes = responseAPI.data.memes_list;

    const filteredCreatedMemes = createdMemes.filter(meme => meme.regionalContent === country);
    const filteredExternalAPIMemes = externalAPIMemes.filter(meme => meme.regionalContent === country);

    const groupedMemes = {
      [country]: [...filteredCreatedMemes, ...filteredExternalAPIMemes]
    };

    response.json(groupedMemes);
  } catch (err) {
    console.error(err);
  }
});

router.post('/', async (req, res) => {
  const meme = new Meme({
    title: req.body.title,
    imageURL: req.body.imageURL,
    regionalContent: req.body.regionalContent,
    category: req.body.category,
    creator: req.body.creator,
  });
  try {
    const savedMeme = await meme.save();
    res.json(savedMeme);
  } catch (err) {
    res.json({ message: err });
  }
});

router.put('/upvote/:id', async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    meme.upvotes += 1;
    const updatedMeme = await meme.save();
    res.json(updatedMeme);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error upvoting meme' });
  }
});

router.put('/downvote/:id', async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    meme.downvotes += 1;
    const updatedMeme = await meme.save();
    res.json(updatedMeme);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error downvoting meme' });
  }
});

//comments
router.post('/:memeId/comments', async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.memeId);

    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }

    const { content, username } = req.body;
    const userExists = await User.exists({ username });

    if (!userExists) {
      return res.status(400).json({ message: 'Please create an account before making a comment' });
    }else{
      const comment = { content, username };
      meme.comments.push(comment);
      const commentCount = meme.comments.length;
      meme.comment_count = commentCount;
      await meme.save();

      res.status(201).json({ message: 'Comment added successfully', comment});
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error occurred while adding the comment' });
  }
});


export default router;
