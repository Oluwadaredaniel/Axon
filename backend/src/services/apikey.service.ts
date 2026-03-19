import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase';

export const apiKeyService = {

  // Generate a new API key
  generate(): string {
    return `axon_${crypto.randomBytes(32).toString('hex')}`;
  },

  // Hash API key for storage
  hash(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  },

  // Create and store a new API key
  async create(userId: string, name: string): Promise<string> {
    const key = apiKeyService.generate();
    const hashed = apiKeyService.hash(key);

    const { error } = await supabaseAdmin
      .from('api_keys')
      .insert({
        user_id: userId,
        name,
        key_hash: hashed,
        key_preview: `${key.slice(0, 12)}...`,
      });

    if (error) throw new Error(error.message);

    // Return the raw key only once — never stored in plain text
    return key;
  },

  // Validate an API key
  async validate(key: string): Promise<any | null> {
    const hashed = apiKeyService.hash(key);

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('*, profiles(*)')
      .eq('key_hash', hashed)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    // Update last used
    await supabaseAdmin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id);

    return data;
  },

  // List all keys for user
  async list(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, name, key_preview, is_active, last_used_at, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  // Revoke a key
  async revoke(userId: string, keyId: string) {
    const { error } = await supabaseAdmin
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  },

  // Delete a key
  async delete(userId: string, keyId: string) {
    const { error } = await supabaseAdmin
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  },
};