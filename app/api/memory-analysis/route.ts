import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Get the absolute path to the binary
    const binaryPath = path.join(process.cwd(), 'bin', 'vmd');
    
    // Execute with absolute path and ensure proper permissions
    const { stdout, stderr } = await execAsync(`chmod +x ${binaryPath} && echo "5" | ${binaryPath}`);
    
    if (stderr) {
      console.error('Error:', stderr);
      return NextResponse.json({ error: 'Failed to get memory analysis' }, { status: 500 });
    }

    // Extract only the JSON part from the output
    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid output format' }, { status: 500 });
    }

    const memoryStats = JSON.parse(jsonMatch[0]);
    return NextResponse.json(memoryStats);
  } catch (error) {
    console.error('Error executing memory analysis:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze memory',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
