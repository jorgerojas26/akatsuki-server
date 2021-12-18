import Guide from '../models/Guide.js';
import TaskGuideInfo from '../models/TaskGuideInfo.js';

const GET_ALL_NEEDED_INFO = async (req, res) => {
  const { task_title } = req.params;

  try {
    const all_guides = await Guide.find({}, { _id: 1, name: 1 });
    const selector_info = await TaskGuideInfo.findOne({ task_title });

    let neededInfo = {
      all_guides,
      selector_info,
      current_task_guide_info: {},
    };

    if (selector_info) {
      const guide_id = selector_info.guide_id;
      const keywords_id = selector_info.keywords_id;
      const script_id = selector_info.script_id;

      const actual_guide_info = await Guide.findOne({ _id: selector_info.guide_id }, { __v: 0 });
      neededInfo.current_task_guide_info = actual_guide_info;

      if (keywords_id !== guide_id) {
        const guide = await Guide.findOne({ _id: keywords_id });
        neededInfo.current_task_guide_info.keywords = guide.keywords;
      }
      if (script_id !== guide_id) {
        const guide = await Guide.findOne({ _id: script_id });
        neededInfo.current_task_guide_info.script = guide.script;
      }
    }

    res.status(200).json(neededInfo);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

const GET_ALL_GUIDES = async (req, res) => {
  const { namesOnly } = req.query;

  try {
    let guides = [];
    if (namesOnly === 'true') {
      guides = await Guide.find({}, { name: 1, _id: 1 }).sort('name');
    } else {
      guides = await Guide.find({}).sort('name');
    }
    res.status(200).json(guides);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

const GET_GUIDE_BY_ID = async (req, res) => {
  try {
    const { id } = req.params;

    const guide = await Guide.findOne({ _id: id });
    if (!guide) {
      return res.status(404).json({ error: { message: 'Guide not found' } });
    }
    console.log(JSON.parse(guide.collections).reverse());

    res.status(200).json(guide);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

const CREATE_GUIDE = async (req, res) => {
  try {
    const { name = '', collections = '', keywords = '', script = '' } = req.body;

    if (!name || name === '') {
      return res.status(400).json({ error: { message: 'name is required' } });
    }

    const guide_exists = (await Guide.findOne({ name }).count()) > 0;

    if (guide_exists) {
      return res.status(404).json({ error: { message: 'A guide with this name already exists' } });
    }

    const guide = new Guide({
      name,
      collections: collections || '[]',
      keywords: keywords || '[]',
      script,
    });
    await guide.save();
    res.status(200).json(guide);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: { message: error.message } });
  }
};

const UPDATE_GUIDE = async (req, res) => {
  try {
    const { name = '', collections, keywords, script } = req.body;
    const { id } = req.params;

    const guide = await Guide.findOne({ _id: id });
    if (!guide) {
      return res.status(404).json({ error: { message: 'Guide not found' } });
    }

    if (name && name !== '') guide.name = name;
    if (collections) guide.collections = collections;
    if (keywords) guide.keywords = keywords;
    if (script) guide.script = script;

    if (!guide.collections) guide.collections = '[]';
    if (!guide.keywords) guide.keywords = '[]';

    await guide.save();
    res.status(200).json(guide);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: { message: error.message } });
  }
};

const ADD_ITEM_TO_GUIDE = async (req, res) => {
  try {
    const { id } = req.params;
    const { task } = req.body;

    const guide = await Guide.findOne({ _id: id });
    if (!guide) {
      return res.status(404).json({ error: { message: 'Guide not found' } });
    }

    const collections = JSON.parse(guide.collections);
    collections.push(task);
    guide.collections = JSON.stringify(collections);

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
    const taskGuideInfo = await TaskGuideInfo.findOne({ task_title: guide.name });

    await guide.remove();
    await taskGuideInfo.remove();
    res.status(200).json({ message: 'Guide deleted' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

export default {
  GET_ALL_GUIDES,
  GET_GUIDE_BY_ID,
  GET_ALL_NEEDED_INFO,
  CREATE_GUIDE,
  UPDATE_GUIDE,
  ADD_ITEM_TO_GUIDE,
  DELETE_GUIDE,
};
