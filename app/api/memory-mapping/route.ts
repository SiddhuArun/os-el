import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

interface MemoryMapping {
  address: string;
  permissions: string;
  offset: string;
  device: string;
  inode: string;
  pathname?: string;
}

function parseMemoryMap(output: string): MemoryMapping[] {
  const lines = output.split('\n');
  const mappings: MemoryMapping[] = [];
  
  // Start parsing after the "Virtual Memory Mapping:" line
  const startIndex = lines.findIndex(line => line.includes('Virtual Memory Mapping:')) + 1;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Example line: 5f6ed35e2000-5f6ed35e3000 r--p 00000000 103:06 3941270 /home/asish/Desktop/os-el/bin/vmd
    const match = line.match(/^([0-9a-f]+-[0-9a-f]+)\s+([rwxps-]+)\s+([0-9a-f]+)\s+([0-9a-f]+:[0-9a-f]+)\s+(\d+)(?:\s+(.+))?$/i);
    
    if (match) {
      mappings.push({
        address: match[1],
        permissions: match[2],
        offset: match[3],
        device: match[4],
        inode: match[5],
        pathname: match[6]
      });
    }
  }
  
  return mappings;
}

export async function GET() {
  try {
    // Get the absolute path to the binary
    const binaryPath = path.join(process.cwd(), 'bin', 'vmd');
    
    // Execute with absolute path and ensure proper permissions
    const { stdout, stderr } = await execAsync(`chmod +x ${binaryPath} && echo "3" | ${binaryPath}`);
    
    if (stderr) {
      console.error('Error:', stderr);
      return NextResponse.json({ error: 'Failed to get memory mapping' }, { status: 500 });
    }

    console.log('Raw output:', stdout);
    const mappings = parseMemoryMap(stdout);
    console.log('Parsed mappings:', mappings);
    return NextResponse.json(mappings);
  } catch (error) {
    console.error('Error executing memory mapping:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze memory mapping',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 