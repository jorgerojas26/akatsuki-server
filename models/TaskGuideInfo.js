import mongoose from 'mongoose';

const taskGuideInfoSchema = new mongoose.Schema({
  task_title: {
    type: String,
    required: true,
  },
  guide_id: {
    type: String,
  },
  keywords_id: {
    type: String,
  },
  script_id: {
    type: String,
  },
});

export default mongoose.model('TaskGuideInfo', taskGuideInfoSchema);
