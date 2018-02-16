import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';
import { models as contents } from 'playing-content-services';
import { models as rules } from 'playing-rule-services';

const settings = {
  maxPlayers: { type: Number },            // maximum number of players that any instances of this type can contain
  maxTeams: { type: Number },              // maximum number of instances of this type that can be created
  playerTeams: { type: Number },           // maximum number of instances of this type that a player can createed
  creation: { type: String, enum: [        // whether the team definition will only be available to public or game admins
    'public', 'private'
  ]},
  requires: rules.rule.requires,           // requirements for creation of an instance from this definition
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

/*
 * Teams let you organize your players into meaningful groups.
 */
const fields = {
  name: { type: String, required: true },  // name for the team
  description: { type: String },           // brief description of the team
  image: contents.blob.schema,             // image which represents the team
  access: [{ type: String, enum: [         // access settings with which the team instance can be created.
    'public', 'protected', 'private'
  ]}],
  settings: settings,                      // settings for the whole team
  permissions: permissions,                // array of roles with permissions associated
  creatorRoles: [{type: String }],         // array of roles which will be assigned to creator
  tags: [{ type: String }],                // tags of the team
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields);
  schema.plugin(timestamps);
  schema.plugin(plugins.softDelete);
  return mongoose.model(name, schema);
}

model.schema = fields;