// app/api/upload-geotif/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { tmpdir } from 'os';
import fetch from 'node-fetch'; // Ensure this is installed
import { v4 as uuidv4 } from 'uuid';

const pump = promisify(pipeline);

export async function POST(req: NextRequest) {
  try {
    // Check if it's a proper multipart/form-data request
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
    }

    // Read multipart/form-data using a 3rd party parser
    const boundary = contentType.split('boundary=')[1];
    const buffer = await req.arrayBuffer();
    const formDataBuffer = Buffer.from(buffer);

    // Minimal parser using `busboy` or similar is ideal, but for now a workaround:
    const parts = formDataBuffer.toString().split(boundary);
    const filePart = parts.find(part => part.includes('filename='));
    const namePart = parts.find(part => part.includes('name="layerName"'));

    if (!filePart || !namePart) {
      return NextResponse.json({ error: 'Missing file or layerName' }, { status: 400 });
    }

    // Extract layer name
    const layerNameMatch = namePart.match(/name="layerName"\r\n\r\n(.+?)\r\n/);
    const layerName = layerNameMatch?.[1]?.trim();
    if (!layerName) {
      return NextResponse.json({ error: 'Invalid layer name' }, { status: 400 });
    }

    // Extract file data
    const fileStart = filePart.indexOf('\r\n\r\n') + 4;
    const fileEnd = filePart.lastIndexOf('--') !== -1 ? filePart.lastIndexOf('--') : filePart.length;
    const fileBuffer = Buffer.from(filePart.slice(fileStart, fileEnd), 'binary');

    const tmpFileName = `${uuidv4()}.tif`;
    const tmpFilePath = path.join(tmpdir(), tmpFileName);

    await fs.writeFile(tmpFilePath, fileBuffer);

    // Upload to GeoServer
    const geoServerUrl = `http://localhost/geoserver/rest/workspaces/test/coveragestores/${layerName}/file.geotiff`;
    const username = 'admin';
    const password = 'geoserver';

    const response = await fetch(geoServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/tiff',
        'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
      },
      body: await fs.readFile(tmpFilePath)
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: 'Failed to upload to GeoServer', details: text }, { status: 500 });
    }

    // Clean up temp file
    await fs.unlink(tmpFilePath);

    return NextResponse.json({ success: true, layerName });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
