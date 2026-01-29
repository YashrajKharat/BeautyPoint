import { userDB } from '../utils/supabaseDB.js';
import { supabase } from '../utils/supabaseDB.js';

export const adminMiddleware = async (req, res, next) => {
  try {
    const user = await userDB.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Admin verification failed', error: error.message });
  }
};
