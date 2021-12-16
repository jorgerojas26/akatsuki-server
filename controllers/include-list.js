import IncludeList from '../models/IncludeList.js';

const GET_INCLUDE_LIST = async (req, res) => {
  try {
    const includeList = await IncludeList.find({}, { __v: 0 });
    res.status(200).json(includeList);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

const CREATE_INCLUDE_LIST_ITEM = async (req, res) => {
  const { task, active } = req.body;
  try {
    const item = await IncludeList.findOne({ task });
    if (item) {
      res.status(400).json({ error: { message: 'Item already exists' } });
    } else {
      const includeList = await IncludeList.create({ task, active });
      res.status(200).json(includeList);
    }
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

const UPDATE_INCLUDE_LIST = async (req, res) => {
  const { id } = req.params;
  const { task, active } = req.body;

  try {
    const includeList = await IncludeList.findByIdAndUpdate(id, { task, active }, { new: true, upsert: true });
    res.status(200).json(includeList);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

export default {
  GET_INCLUDE_LIST,
  CREATE_INCLUDE_LIST_ITEM,
  UPDATE_INCLUDE_LIST,
};
