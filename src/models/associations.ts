import Player from "./astrub_economy/Player";
import Job from "./astrub_economy/Job";

export default function associate() {
    Player.hasMany(Job, {
        foreignKey: 'userId',
        as: 'jobs',
        onDelete: 'CASCADE'
    });
}