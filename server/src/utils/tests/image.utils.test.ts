import * as fs from 'fs';
import { saveImageFromBase64 } from '../image.utils';

jest.mock('fs');


describe('saveImageFromBase64', (): void => {
    it('should handle invalid base64 format gracefully', (): void => {
        const invalidBase64: string = 'invalid-base64-string';
        (fs.writeFileSync as jest.Mock).mockImplementation((): void => {});
        expect(() => saveImageFromBase64(invalidBase64)).toThrowError('Invalid base64 format');
    });
});
