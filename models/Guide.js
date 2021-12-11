import mongoose from 'mongoose';

const guideSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  collections: {
    type: [Object],
  },
  keywords: {
    type: [Object],
  },
});

export default mongoose.model('Guide', guideSchema);
