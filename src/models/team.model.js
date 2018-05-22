/**
 * Group created by team definition
 */
const fields = {
  definition: { type: 'ObjectId' },        // team definition
  access: { type: String, enum: [          // visibility setting
    'PUBLIC', 'PROTECTED', 'PRIVATE'
  ]}
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const GroupModel = mongoose.model('group');
  const schema = new mongoose.Schema(fields);
  return GroupModel.discriminator(name, schema);
}

model.schema = fields;