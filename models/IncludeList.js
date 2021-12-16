import mongoose from 'mongoose';

const includeListSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: false,
  },
});

export default mongoose.model('IncludeList', includeListSchema);
