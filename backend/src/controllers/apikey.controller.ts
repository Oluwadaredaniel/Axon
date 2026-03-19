import { Request, Response } from 'express';
import { apiKeyService } from '../services/apikey.service';

export const apiKeyController = {

  // Create new API key
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Key name is required' });
      }

      // Check key limit — max 5 keys per user
      const existing = await apiKeyService.list(userId);
      if (existing.length >= 5) {
        return res.status(400).json({
          error: 'Maximum of 5 API keys allowed. Revoke an existing key first.',
        });
      }

      const key = await apiKeyService.create(userId, name);

      return res.status(201).json({
        key,
        message: 'Save this key now — it will never be shown again.',
      });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // List all keys
  async list(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const keys = await apiKeyService.list(userId);
      return res.json({ keys });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Revoke a key
  async revoke(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      await apiKeyService.revoke(userId, String(id));

      return res.json({ message: 'API key revoked successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete a key
  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      await apiKeyService.delete(userId, String(id));

      return res.json({ message: 'API key deleted successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};