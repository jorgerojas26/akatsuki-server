import mongoose from 'mongoose';

const guideSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  collections: {
    type: String,
    required: false,
    default: '[]',
  },
  keywords: {
    type: String,
    required: false,
    default: '[]',
  },
  script: {
    type: String,
    required: false,
    default: '',
  },
});

export default mongoose.model('Guide', guideSchema);
