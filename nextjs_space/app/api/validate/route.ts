
import { NextRequest, NextResponse } from 'next/server'
import { runValidationTests } from '@/lib/test-runner'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transformed_prompt, original_input } = body

    if (!transformed_prompt?.trim() || !original_input?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Both transformed prompt and original input are required' },
        { status: 400 }
      )
    }

    // Run validation tests only
    const testResults = await runValidationTests(transformed_prompt, original_input)

    return NextResponse.json({
      success: true,
      test_summary: testResults
    })

  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error during validation' },
      { status: 500 }
    )
  }
}
