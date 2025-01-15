import * as fs from 'fs';
import * as path from 'path';
import { Buffer } from 'buffer';


export function saveImageFromBase64(base64Image: string): string {
    const base64Data: string = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const imagePath: string = path.join(__dirname, '../../uploads/people', `${Date.now()}.jpg`);
    fs.writeFileSync(imagePath, imageBuffer);
    return `/uploads/people/${path.basename(imagePath)}`;
}