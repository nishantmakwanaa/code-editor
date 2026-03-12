/**
 * API route handler for fetching server status from BetterStack.
 * Features:
 * - Uptime monitoring status
 * - Error handling
 * - Status response formatting
 *
 * Owned by Nishant Makwana
 */

import { NextResponse } from 'next/server';

import { BASE_SERVER_URL, KASCA_SERVER_MONITOR_ID } from '@/lib/constants';
import type { BetterStackResponse } from '@/components/status/types';

// export const runtime = 'edge';

export async function GET() {
  try {
    if (!KASCA_SERVER_MONITOR_ID || !process.env.BETTERSTACK_API_KEY) {
      const response = await fetch(BASE_SERVER_URL, {
        method: 'GET',
        cache: 'no-store'
      });

      return NextResponse.json({
        data: {
          attributes: {
            status: response.ok ? 'up' : 'down'
          }
        }
      });
    }

    const response = await fetch(
      `https://uptime.betterstack.com/api/v2/monitors/${KASCA_SERVER_MONITOR_ID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.BETTERSTACK_API_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch status');
    }

    const data = (await response.json()) as BetterStackResponse;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching server status:', error);
    return NextResponse.json(
      {
        data: {
          attributes: {
            status: 'down'
          }
        }
      },
      { status: 200 }
    );
  }
}
