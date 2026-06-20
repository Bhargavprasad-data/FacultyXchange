import { query } from '../config/pgClient.js';

export const notifyFaculty = async (facultyId, message, type = 'System', relatedId = null) => {
  try {
    await query(
      `INSERT INTO notification (recipient_id, message, type, related_id)
       VALUES ($1, $2, $3, $4)`,
      [facultyId, message, type, relatedId]
    );
  } catch (error) {
    console.error('Failed to send notification to faculty:', error);
  }
};

export const notifyAdmins = async (message, type = 'System', relatedId = null) => {
  try {
    const { rows: admins } = await query("SELECT id FROM faculty WHERE role = 'Admin'");
    for (const admin of admins) {
      await query(
        `INSERT INTO notification (recipient_id, message, type, related_id)
         VALUES ($1, $2, $3, $4)`,
        [admin.id, message, type, relatedId]
      );
    }
  } catch (error) {
    console.error('Failed to send notification to admins:', error);
  }
};
