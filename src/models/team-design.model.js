import { plugins } from 'mostly-feathers-mongoose';
import { schemas as contents } from 'playing-content-common';
import { schemas as rules } from 'playing-rule-common';

const options = {
  timestamps: true
};

const settings = {
  maxPlayers: { type: Number },            // maximum number of players that any instances of this type can contain
  maxTeams: { type: Number },              // maximum number of instances of this type that can be created
  playerTeams: { type: Number },           // maximum number of instances of this type that a player can createed
  creation: { type: String, enum: [        // whether the team definition will only be available to public or admins only
    'PUBLIC', 'PRIVATE'
  ]},
  requires: rules.requires.schema,         // requirements for creation of an instance from this definition
};

const permissions = [{
  role: { type: String },                  // name of the role
  permits: {                               // map of all permissions, each having a boolean value
    lock: { type: Boolean },               // player can lock the team, so no member can join or leave the team
    peer: { type: Boolean },               // player can invite others to the same role
    assign: { type: Boolean },             // player can invite others to lower roles
    leave: { type: Boolean }               // player can leave the team.
  }
}];

/**
 * Teams let you organize your players into meaningful groups.
 */
const fields = {
  name: { type: String, required: true },  // name for the team
  description: { type: String },           // brief description of the team
  image: contents.blob.schema,             // image which represents the team
  access: [{ type: String, enum: [         // access settings with which the team instance can be created.
    'PUBLIC', 'PROTECTED', 'PRIVATE'
  ]}],
  settings: settings,                      // settings for the whole team
  permissions: permissions,                // array of roles with permissions associated
  creatorRoles: [{type: String }],         // array of roles which will be assigned to creator
  tags: [{ type: String }],                // tags of the team
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields, options);
  schema.plugin(plugins.trashable);
  return mongoose.model(name, schema);
}

model.schema = fields;