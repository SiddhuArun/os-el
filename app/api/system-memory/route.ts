import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

interface MemoryInfo {
  [key: string]: number;
}

function parseMemInfo(output: string): MemoryInfo {
  const lines = output.split('\n');
  const memInfo: MemoryInfo = {};
  
  // Start parsing after the "System-wide Memory Information:" line
  const startIndex = lines.findIndex(line => line.includes('System-wide Memory Information:')) + 1;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const match = line.match(/^(\w+):\s+(\d+)\s*(\w+)/);
    if (match) {
      const [, key, value, unit] = match;
      // Convert all values to bytes for consistency
      const multiplier = unit.toLowerCase() === 'kb' ? 1024 : 1;
      memInfo[key] = parseInt(value) * multiplier;
    }
  }
  
  return memInfo;
}

export async function GET() {
  try {
    // Get the absolute path to the binary
    const binaryPath = path.join(process.cwd(), 'bin', 'vmd');
    
    // Execute with absolute path and ensure proper permissions
    const { stdout, stderr } = await execAsync(`chmod +x ${binaryPath} && echo "1" | ${binaryPath}`);
    
    if (stderr) {
      console.error('Error:', stderr);
      return NextResponse.json({ error: 'Failed to get system memory info' }, { status: 500 });
    }

    console.log('Raw output:', stdout);
    const memoryInfo = parseMemInfo(stdout);
    return NextResponse.json(memoryInfo);
  } catch (error) {
    console.error('Error executing system memory analysis:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze system memory',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 