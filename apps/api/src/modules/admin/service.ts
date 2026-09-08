import { pool } from '../../db/pool.js';

export const adminService = {
  async metrics() {
    const [users, projects, approved, last7d] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS n FROM users'),
      pool.query('SELECT COUNT(*)::int AS n FROM projects'),
      pool.query(`SELECT COUNT(*)::int AS n FROM projects WHERE status = 'approved'`),
      pool.query(`SELECT COUNT(*)::int AS n FROM projects WHERE created_at >= now() - interval '7 days'`),
    ]);
    return {
      totalUsers: users.rows[0].n,
      totalProjects: projects.rows[0].n,
      approvedProjects: approved.rows[0].n,
      projectsLast7d: last7d.rows[0].n,
    };
  },

  async listUsers() {
    const { rows } = await pool.query(
      `SELECT id, email, display_name, role, created_at FROM users ORDER BY created_at DESC LIMIT 200`,
    );
    return rows;
  },

  async deleteUser(userId: string): Promise<boolean> {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    return (rowCount ?? 0) > 0;
  },
};
