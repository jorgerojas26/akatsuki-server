import TaskGuideInfo from '../models/TaskGuideInfo.js';
import Guide from '../models/Guide.js';

const GET_TASK_GUIDE_INFO_BY_TITLE = async (req, res) => {
  const { task_title } = req.params;

  try {
    let taskGuideInfo = await TaskGuideInfo.findOne({ task_title });

    if (!taskGuideInfo) {
      taskGuideInfo = await TaskGuideInfo.create({
        task_title,
        guide_id: 'none',
        keywords_id: 'none',
        script_id: 'none',
      });
    }

    res.json(taskGuideInfo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

const UPDATE_TASK_GUIDE_INFO_BY_TITLE = async (req, res) => {
  const { task_title } = req.params;
  const { guide_id, keywords_id, script_id } = req.body;

  try {
    let taskGuideInfo = await TaskGuideInfo.findOne({ task_title });

    if (!taskGuideInfo) {
      taskGuideInfo = await TaskGuideInfo.create({ task_title, guide_id, keywords_id, script_id });
    }

    if (guide_id) taskGuideInfo.guide_id = guide_id;
    if (keywords_id) taskGuideInfo.keywords_id = keywords_id;
    if (script_id) taskGuideInfo.script_id = script_id;

    await taskGuideInfo.save();

    let guide_info = {};

    const actual_guide_info = await Guide.findOne({ _id: taskGuideInfo.guide_id }, { _id: 0, __v: 0 });
    guide_info = actual_guide_info;

    if (taskGuideInfo.keywords_id !== guide_id) {
      const guide = await Guide.findOne({ _id: taskGuideInfo.keywords_id });
      guide_info.keywords = guide.keywords;
    }
    if (taskGuideInfo.script_id !== guide_id) {
      const guide = await Guide.findOne({ _id: taskGuideInfo.script_id });
      guide_info.script = guide.script;
    }

    res.json({ selector_info: taskGuideInfo, guide_info });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

export default {
  GET_TASK_GUIDE_INFO_BY_TITLE,
  UPDATE_TASK_GUIDE_INFO_BY_TITLE,
};
