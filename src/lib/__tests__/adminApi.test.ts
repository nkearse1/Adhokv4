import { vi, describe, test, expect, beforeEach } from 'vitest';
import { logAdminAction } from '../logAdminAction';

// Mock supabase client before importing code under test
vi.mock('../supabaseClient', () => ({
  supabase: {
    rpc: vi.fn(() => Promise.resolve({ error: null }))
  }
}));

// Mock admin auth functions
vi.mock('../logAdminAction', () => ({
  logAdminAction: vi.fn(() => Promise.resolve())
}));

import { updateUserStatusAPI, updateProjectStatusAPI } from '../adminApi';
import { supabase } from '../supabaseClient';

describe('Admin API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateUserStatusAPI', () => {
    test('successfully updates user status', async () => {
      const result = await updateUserStatusAPI('user123', 'approved');
      
      expect(supabase.rpc).toHaveBeenCalledWith(
        'update_user_status',
        { user_id: 'user123', new_status: 'approved' }
      );
      expect(logAdminAction).toHaveBeenCalledWith(
        'update_user_status_approved',
        'talent_profiles',
        'user123',
        { newStatus: 'approved' }
      );
      expect(result).toEqual({ success: true });
    });

    test('throws error when update fails', async () => {
      const mockError = new Error('Update failed');
      
      vi.mocked(supabase.rpc).mockResolvedValueOnce({ error: mockError } as any);

      await expect(updateUserStatusAPI('user123', 'approved'))
        .rejects
        .toThrow('Update failed');
    });
  });

  describe('updateProjectStatusAPI', () => {
    test('successfully updates project status', async () => {
      const result = await updateProjectStatusAPI('proj456', 'archived');
      
      expect(supabase.rpc).toHaveBeenCalledWith(
        'update_project_status',
        { project_id: 'proj456', new_status: 'archived' }
      );
      expect(logAdminAction).toHaveBeenCalledWith(
        'update_project_status_archived',
        'projects',
        'proj456',
        { newStatus: 'archived' }
      );
      expect(result).toEqual({ success: true });
    });

    test('throws error when update fails', async () => {
      const mockError = new Error('Update failed');
      
      vi.mocked(supabase.rpc).mockResolvedValueOnce({ error: mockError } as any);

      await expect(updateProjectStatusAPI('proj456', 'archived'))
        .rejects
        .toThrow('Update failed');
    });
  });
});