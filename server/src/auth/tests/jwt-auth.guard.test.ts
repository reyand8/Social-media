import { JwtService } from '@nestjs/jwt';
import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../jwt-auth.guard';


describe('JwtAuthGuard', (): void => {
    let guard: JwtAuthGuard;
    let jwtService: JwtService;
    let mockExecutionContext: ExecutionContext;

    beforeEach(async (): Promise<void> => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtAuthGuard,
                {
                    provide: JwtService,
                    useValue: {
                        verifyAsync: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<JwtAuthGuard>(JwtAuthGuard);
        jwtService = module.get<JwtService>(JwtService);

        mockExecutionContext = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    headers: {
                        authorization: 'Bearer valid-token',
                    },
                }),
            }),
        } as unknown as ExecutionContext;
    });

    it('should be defined', (): void => {
        expect(guard).toBeDefined();
    });

    it('should return false if no authorization header is present', async (): Promise<void> => {
        (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue({
            headers: {},
        });
        const result: boolean = await guard.canActivate(mockExecutionContext);
        expect(result).toBe(false);
    });

    it('should return false if token is not provided in the authorization header', async (): Promise<void> => {
        (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue({
            headers: {
                authorization: 'Bearer',
            },
        });
        const result: boolean = await guard.canActivate(mockExecutionContext);
        expect(result).toBe(false);
    });

    it('should return false if token is invalid', async (): Promise<void> => {
        jwtService.verifyAsync = jest.fn().mockRejectedValue(new Error('Invalid token'));
        const result: boolean = await guard.canActivate(mockExecutionContext);
        expect(result).toBe(false);
    });

    it('should return true if token is valid', async (): Promise<void> => {
        jwtService.verifyAsync = jest.fn().mockResolvedValue({ userId: 1 });
        const result: boolean = await guard.canActivate(mockExecutionContext);
        expect(result).toBe(true);
    });

    it('should assign user to the request object if token is valid', async (): Promise<void> => {
        const mockUser: {userId: number} = { userId: 1 };
        jwtService.verifyAsync = jest.fn().mockResolvedValue(mockUser);
        const result: boolean = await guard.canActivate(mockExecutionContext);
        expect(result).toBe(true);
        const request = mockExecutionContext.switchToHttp().getRequest();
        expect(request.user).toEqual(mockUser);
    });
});
