import IncludeList from '../models/IncludeList.js';

const GET_INCLUDE_LIST = async (req, res) => {
  try {
    const includeList = await IncludeList.find({}, { __v: 0 });
    res.status(200).json(includeList);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

const CREATE_INCLUDE_LIST_ITEM = async (req, res, io) => {
  const { task, active } = req.body;
  try {
    const item = await IncludeList.findOne({ task });
    if (item) {
      res.status(400).json({ error: { message: 'Item already exists' } });
    } else {
      const newItem = await IncludeList.create({ task, active });
      io.emit('includeList', { action: 'create', newItem });
      res.status(200).json(newItem);
    }
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

const UPDATE_INCLUDE_LIST = async (req, res, io) => {
  const { id } = req.params;
  const { task, active } = req.body;

  try {
    const includeList = await IncludeList.findByIdAndUpdate(id, { task, active }, { new: true, upsert: true });
    io.emit('includeList', { action: 'update', includeList });
    res.status(200).json(includeList);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

const DELETE_INCLUDE_LIST_ITEM = async (req, res, io) => {
  const { id } = req.params;

  try {
    const includeList = await IncludeList.findByIdAndDelete(id);
    io.emit('includeList', { action: 'delete', includeList });
    res.status(200).json(includeList);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

export default {
  GET_INCLUDE_LIST,
  CREATE_INCLUDE_LIST_ITEM,
  UPDATE_INCLUDE_LIST,
  DELETE_INCLUDE_LIST_ITEM,
};
