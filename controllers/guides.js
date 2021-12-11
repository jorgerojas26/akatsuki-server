import Guide from '../models/Guide.js';

const GET_ALL_GUIDES = async (req, res) => {
  const { namesOnly } = req.query;

  try {
    if (namesOnly === 'true') {
      const guides = await Guide.find({}, { name: 1, _id: 1 });
      res.status(200).json(guides);
    } else {
      const guides = await Guide.find({});
      res.status(200).json(guides);
    }
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

const CREATE_GUIDE = async (req, res) => {
  try {
    const { name = '', collections = [], keywords = [] } = req.body;

    if (!name || name === '') {
      return res.status(400).json({ error: { message: 'name is required' } });
    }

    const guide_exists = (await Guide.findOne({ name }).count()) > 0;

    if (guide_exists) {
      return res.status(404).json({ error: { message: 'name already exists' } });
    }

    const guide = new Guide({
      name,
      collections,
      keywords,
    });
    await guide.save();
    res.status(200).json(guide);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

const UPDATE_GUIDE = async (req, res) => {
  try {
    const { name = '', collections = [], keywords = [] } = req.body;
    const { id } = req.params;
    console.log(id);

    const guide = await Guide.findOne({ name: id });
    if (!guide) {
      return res.status(404).json({ error: { message: 'Guide not found' } });
    }

    if (name && name !== '') {
      guide.name = name;
    }

    if (collections) {
      guide.collections = collections;
    }

    if (keywords) {
      guide.keywords = keywords;
    }

    await guide.save();
    res.status(200).json(guide);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

const DELETE_GUIDE = async (req, res) => {
  try {
    const { id } = req.params;

    const guide = await Guide.findOne({ _id: id });
    if (!guide) {
      return res.status(404).json({ error: { message: 'Guide not found' } });
    }

    await guide.remove();
    res.status(200).json({ message: 'Guide deleted' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

export default {
  GET_ALL_GUIDES,
  CREATE_GUIDE,
  UPDATE_GUIDE,
  DELETE_GUIDE,
};
