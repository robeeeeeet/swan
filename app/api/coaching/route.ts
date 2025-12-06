/**
 * Coaching API Route
 * Generates AI-powered coaching messages for users
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateCoachingMessage,
  buildCoachingContext,
  type CoachingMessageType,
} from '@/lib/ai';

/**
 * POST /api/coaching
 * Generate a coaching message based on type and user context
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const { type, context } = body as {
      type: CoachingMessageType;
      context: {
        daysTracking: number;
        todaySmoked: number;
        todayCraved: number;
        todayResisted: number;
        dailyGoal: number;
        weeklyAverage?: number;
        yesterdaySmoked?: number;
        situationTags?: string[];
        userName?: string;
      };
    };

    if (!type) {
      return NextResponse.json(
        { error: 'Missing required field: type' },
        { status: 400 }
      );
    }

    // Validate message type
    const validTypes: CoachingMessageType[] = [
      'morning_briefing',
      'craving_alert',
      'step_down',
      'survival_check',
      'sos_encouragement',
      'success_celebration',
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid message type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Build coaching context with defaults
    const coachingContext = buildCoachingContext({
      daysTracking: context?.daysTracking ?? 1,
      todaySmoked: context?.todaySmoked ?? 0,
      todayCraved: context?.todayCraved ?? 0,
      todayResisted: context?.todayResisted ?? 0,
      dailyGoal: context?.dailyGoal ?? 20,
      weeklyAverage: context?.weeklyAverage,
      yesterdaySmoked: context?.yesterdaySmoked,
      situationTags: context?.situationTags,
      userName: context?.userName,
    });

    // Generate the coaching message
    const result = await generateCoachingMessage(type, coachingContext);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API/Coaching] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate coaching message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/coaching
 * Health check and API info
 */
export async function GET() {
  return NextResponse.json({
    name: 'Swan Coaching API',
    version: '1.0.0',
    availableTypes: [
      'morning_briefing',
      'craving_alert',
      'step_down',
      'survival_check',
      'sos_encouragement',
      'success_celebration',
    ],
    usage: 'POST with { type: string, context: UserCoachingContext }',
  });
}
